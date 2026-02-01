import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateFileDto } from './dto/file.dto';

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async create(projectId: string, userId: string, createFileDto: CreateFileDto) {
    // Verify project access
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        editors: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Only creator can upload files
    if (project.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can upload files');
    }

    const file = await this.prisma.file.create({
      data: {
        ...createFileDto,
        projectId,
        size: BigInt(createFileDto.size),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return file;
  }

  async findAll(projectId: string, userId: string, userRole: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        editors: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check access
    if (project.creatorId !== userId && userRole !== 'CREATOR') {
      const editorAccess = project.editors.find(
        (e) => e.editorId === userId && e.canView,
      );
      if (!editorAccess) {
        throw new ForbiddenException('Access denied');
      }
    }

    return this.prisma.file.findMany({
      where: { projectId },
      select: {
        id: true,
        name: true,
        mimeType: true,
        size: true,
        uploadedAt: true,
        checksum: true,
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const file = await this.prisma.file.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            editors: true,
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Check access
    if (file.project.creatorId !== userId && userRole !== 'CREATOR') {
      const editorAccess = file.project.editors.find(
        (e) => e.editorId === userId && e.canView,
      );
      if (!editorAccess) {
        throw new ForbiddenException('Access denied');
      }
    }

    return file;
  }

  async getSignedUrl(
    fileId: string,
    userId: string,
    userRole: string,
    action: string = 'view',
  ) {
    const file = await this.findOne(fileId, userId, userRole);

    // Check permissions based on action
    if (action === 'open_in_editor') {
      if (file.project.creatorId !== userId && userRole !== 'CREATOR') {
        const editorAccess = file.project.editors.find(
          (e) => e.editorId === userId && e.canOpenInEditor,
        );
        if (!editorAccess) {
          throw new ForbiddenException('Permission denied: cannot open in editor');
        }
      }
    } else if (action === 'download') {
      if (file.project.creatorId !== userId && userRole !== 'CREATOR') {
        const editorAccess = file.project.editors.find(
          (e) => e.editorId === userId && e.canDownload,
        );
        if (!editorAccess) {
          throw new ForbiddenException('Permission denied: cannot download');
        }
      }
    }

    // Log access
    await this.prisma.accessLog.create({
      data: {
        fileId: file.id,
        userId,
        action,
      },
    });

    // Generate signed URL
    const signedUrl = await this.storageService.getSignedUrl(
      file.storagePath,
      action === 'open_in_editor' ? 60 : 15, // Longer expiry for editor access
    );

    return {
      url: signedUrl,
      expiresIn: action === 'open_in_editor' ? 3600 : 900, // seconds
      file: {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size.toString(),
      },
    };
  }

  async remove(fileId: string, userId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      include: {
        project: true,
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Only creator can delete files
    if (file.project.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can delete files');
    }

    // Delete from storage
    await this.storageService.deleteFile(file.storagePath);

    // Delete from database
    return this.prisma.file.delete({
      where: { id: fileId },
    });
  }
}
