import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFileDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  mimeType: string;

  @ApiProperty()
  @IsString()
  storagePath: string;

  @ApiProperty()
  size: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  checksum?: string;
}

export class GetFileUrlDto {
  @ApiProperty({ example: 'open_in_editor' })
  @IsOptional()
  @IsString()
  action?: string;
}
