import { IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Summer Campaign 2024' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Video project for summer campaign', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateProjectDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class InviteEditorDto {
  @ApiProperty({ example: 'editor@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  canView?: boolean;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  canDownload?: boolean;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  canOpenInEditor?: boolean;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  canShare?: boolean;
}

export class UpdateEditorPermissionsDto {
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  canView?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  canDownload?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  canOpenInEditor?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  canShare?: boolean;
}
