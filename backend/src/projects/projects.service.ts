import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, InviteEditorDto, UpdateEditorPermissionsDto } from './dto/project.dto';
import { InvitesService } from '../invites/invites.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private invitesService: InvitesService,
  ) {}

  async create(userId: string, createProjectDto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        ...createProjectDto,
        creatorId: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        editors: {
          include: {
            editor: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        files: true,
      },
    });
  }

  async findAll(userId: string, role: string) {
    if (role === 'CREATOR') {
      // Creators see their own projects
      return this.prisma.project.findMany({
        where: { creatorId: userId },
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          editors: {
            include: {
              editor: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
          files: {
            select: {
              id: true,
              name: true,
              size: true,
              mimeType: true,
              uploadedAt: true,
            },
          },
          _count: {
            select: {
              files: true,
              editors: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    } else {
      // Editors see projects they're invited to
      return this.prisma.project.findMany({
        where: {
          editors: {
            some: {
              editorId: userId,
            },
          },
        },
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          editors: {
            include: {
              editor: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
          files: {
            select: {
              id: true,
              name: true,
              size: true,
              mimeType: true,
              uploadedAt: true,
            },
          },
          _count: {
            select: {
              files: true,
              editors: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }
  }

  async findOne(id: string, userId: string, role: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        editors: {
          include: {
            editor: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        files: {
          select: {
            id: true,
            name: true,
            size: true,
            mimeType: true,
            uploadedAt: true,
            checksum: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check access
    if (project.creatorId !== userId && role !== 'CREATOR') {
      const hasAccess = project.editors.some(
        (e) => e.editorId === userId && e.canView,
      );
      if (!hasAccess) {
        throw new ForbiddenException('Access denied');
      }
    }

    return project;
  }

  async update(id: string, userId: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can update the project');
    }

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        editors: {
          include: {
            editor: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        files: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can delete the project');
    }

    return this.prisma.project.delete({
      where: { id },
    });
  }

  async inviteEditor(
    projectId: string,
    userId: string,
    inviteEditorDto: InviteEditorDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can invite editors');
    }

    // Check if user already invited
    const existingEditor = await this.prisma.user.findUnique({
      where: { email: inviteEditorDto.email },
      include: {
        editorProjects: {
          where: { projectId },
        },
      },
    });

    if (existingEditor?.editorProjects.length > 0) {
      throw new ConflictException('Editor already invited to this project');
    }

    // Create invite token and send email
    return this.invitesService.createInvite(projectId, inviteEditorDto);
  }

  async removeEditor(projectId: string, userId: string, editorId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can remove editors');
    }

    return this.prisma.projectEditor.deleteMany({
      where: {
        projectId,
        editorId,
      },
    });
  }

  async updateEditorPermissions(
    projectId: string,
    userId: string,
    editorId: string,
    permissions: UpdateEditorPermissionsDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can update permissions');
    }

    return this.prisma.projectEditor.update({
      where: {
        projectId_editorId: {
          projectId,
          editorId,
        },
      },
      data: permissions,
      include: {
        editor: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }
}
