import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ItineraryFlightDto {
  @ApiProperty({type: 'string'})
  @IsString()
  departureTime: String;

  @ApiProperty({type: 'string'})
  @IsString()
  arrivalTime: String;

  @ApiProperty({type: 'string'})
  @IsString()
  departureCity: String;

  @ApiProperty({type: 'string'})
  @IsString()
  arrivalCity: String;

  @ApiProperty({type: 'string'})
  @IsString()
  airport: String;

  @ApiProperty({type: 'string'})
  @IsString()
  duration: String;

  @ApiProperty({type: 'string'})
  @IsString()
  directFlight: String;

  @ApiProperty({type: 'string'})
  @IsString()
  carrier: String;

  @ApiProperty({type: 'string'})
  @IsString()
  pricePerPerson: String;

  @ApiProperty({type: 'string'})
  @IsString()
  priceTotal: String;

  @ApiProperty({type: 'string'})
  @IsString()
  flightUrl: String;
}
