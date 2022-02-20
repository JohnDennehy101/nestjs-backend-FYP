import { IsString } from 'class-validator';

export class ItineraryFlightDto {
  @IsString()
  departureTime: String;

  @IsString()
  arrivalTime: String;

  @IsString()
  departureCity: String;

  @IsString()
  arrivalCity: String;

  @IsString()
  airport: String;

  @IsString()
  duration: String;

  @IsString()
  directFlight: String;

  @IsString()
  carrier: String;

  @IsString()
  pricePerPerson: String;

  @IsString()
  priceTotal: String;

  @IsString()
  flightUrl: String;
}
