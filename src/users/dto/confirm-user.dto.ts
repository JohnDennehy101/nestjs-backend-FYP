import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
