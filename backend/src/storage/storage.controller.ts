import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload-url')
  @ApiOperation({ summary: 'Get signed URL for direct upload to S3' })
  async getUploadUrl(
    @Body() body: { projectId: string; fileName: string; contentType: string },
    @CurrentUser() user: any,
  ) {
    const key = this.storageService.generateKey(
      body.projectId,
      body.fileName,
    );

    const url = await this.storageService.getUploadUrl(key, body.contentType);

    return {
      uploadUrl: url,
      key,
      expiresIn: 900, // 15 minutes
    };
  }
}
