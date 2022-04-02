import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ItineraryActivityDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  name: String;

  @ApiProperty({ type: 'string' })
  @IsString()
  vicinity: String;

  @ApiProperty({ type: 'string' })
  @IsString()
  rating: String;

  @ApiProperty({ type: 'string' })
  @IsString()
  user_ratings_total: String;

  @ApiProperty({ type: 'string' })
  @IsString()
  mapLink: String;

  @ApiProperty({ type: 'string' })
  @IsString()
  placesId: String;
}
