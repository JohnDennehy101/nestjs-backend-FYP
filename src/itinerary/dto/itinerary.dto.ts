import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean } from 'class-validator';
import { ItineraryAccommodationDto } from './itinerary.accommodation.dto';
import { ItineraryActivityDto } from './itinerary.activity.dto';
import { ItineraryFlightDto } from './itinerary.flight.dto';

export class ItineraryDto {
  @ApiProperty()
  @IsArray()
  flight: ItineraryFlightDto[];

  @ApiProperty()
  @IsArray()
  accommodation: ItineraryAccommodationDto[];

  @ApiProperty()
  @IsArray()
  activities: ItineraryActivityDto[];

  @ApiProperty()
  @IsBoolean()
  completed: boolean;
}
