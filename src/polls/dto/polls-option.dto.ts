import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';

export class PollOptionDto {
  @ApiProperty()
  @IsDate()
  startDate: string;

  @ApiProperty()
  @IsDate()
  endDate: string;
}
