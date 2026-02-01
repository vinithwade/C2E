import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateProjectDto,
  UpdateProjectDto,
  InviteEditorDto,
  UpdateEditorPermissionsDto,
} from './dto/project.dto';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  create(@CurrentUser() user: any, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(user.id, createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects (creator or editor view)' })
  findAll(@CurrentUser() user: any) {
    return this.projectsService.findAll(user.id, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.findOne(id, user.id, user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, user.id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.remove(id, user.id);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite editor to project' })
  inviteEditor(
    @Param('id') projectId: string,
    @CurrentUser() user: any,
    @Body() inviteEditorDto: InviteEditorDto,
  ) {
    return this.projectsService.inviteEditor(projectId, user.id, inviteEditorDto);
  }

  @Delete(':id/editors/:editorId')
  @ApiOperation({ summary: 'Remove editor from project' })
  removeEditor(
    @Param('id') projectId: string,
    @Param('editorId') editorId: string,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.removeEditor(projectId, user.id, editorId);
  }

  @Patch(':id/editors/:editorId/permissions')
  @ApiOperation({ summary: 'Update editor permissions' })
  updateEditorPermissions(
    @Param('id') projectId: string,
    @Param('editorId') editorId: string,
    @CurrentUser() user: any,
    @Body() permissions: UpdateEditorPermissionsDto,
  ) {
    return this.projectsService.updateEditorPermissions(
      projectId,
      user.id,
      editorId,
      permissions,
    );
  }
}
