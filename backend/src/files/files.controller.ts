import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateFileDto, GetFileUrlDto } from './dto/file.dto';

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('projects/:projectId')
  @ApiOperation({ summary: 'Create file metadata (after upload to S3)' })
  create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: any,
    @Body() createFileDto: CreateFileDto,
  ) {
    return this.filesService.create(projectId, user.id, createFileDto);
  }

  @Get('projects/:projectId')
  @ApiOperation({ summary: 'Get all files in a project' })
  findAll(
    @Param('projectId') projectId: string,
    @CurrentUser() user: any,
  ) {
    return this.filesService.findAll(projectId, user.id, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.filesService.findOne(id, user.id, user.role);
  }

  @Get(':id/url')
  @ApiOperation({ summary: 'Get signed URL for file access' })
  getSignedUrl(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Query() query: GetFileUrlDto,
  ) {
    return this.filesService.getSignedUrl(
      id,
      user.id,
      user.role,
      query.action || 'view',
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.filesService.remove(id, user.id);
  }
}
