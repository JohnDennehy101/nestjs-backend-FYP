import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CloudinaryUserImageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  asset_id: string;

  @ApiProperty({ type: 'string' })
  public_id: string;

  @ApiProperty({ type: 'number' })
  version: number;

  @ApiProperty({ type: 'string' })
  version_id: string;

  @ApiProperty({ type: 'string' })
  signature: string;

  @ApiProperty({ type: 'number' })
  width: number;

  @ApiProperty({ type: 'number' })
  height: number;

  @ApiProperty({ type: 'string' })
  format: string;

  @ApiProperty({ type: 'string' })
  resource_type: string;

  @ApiProperty({ type: 'string' })
  created_at: string;

  @ApiProperty({ type: 'array' })
  tags: object[];

  @ApiProperty({ type: 'number' })
  pages: number;

  @ApiProperty({ type: 'number' })
  bytes: number;

  @ApiProperty({ type: 'string' })
  type: string;

  @ApiProperty({ type: 'string' })
  etag: string;

  @ApiProperty({ type: 'boolean' })
  placeholder: boolean;

  @ApiProperty({ type: 'string' })
  url: string;

  @ApiProperty({ type: 'string' })
  secure_url: string;

  @ApiProperty({ type: 'string' })
  access_mode: string;

  @ApiProperty({ type: 'string' })
  original_filename: string;

  @ApiProperty({ type: 'array' })
  eager: object[];
}
