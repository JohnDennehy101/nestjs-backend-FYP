import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsString } from 'class-validator';

export class EventDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsEmail({}, { each: true })
  userEmails: string[];

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  departureCity: string;
}
