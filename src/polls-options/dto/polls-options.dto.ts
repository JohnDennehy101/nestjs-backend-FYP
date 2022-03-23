import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';

export class PollsOptionDto {
  @ApiProperty()
  @IsDate()
  startDate: string;

  @ApiProperty()
  @IsDate()
  endDate: string;
}
