import { IsArray } from "class-validator";
import { ItineraryAccommodationDto } from "./itinerary.accommodation.dto";
import { ItineraryFlightDto } from "./itinerary.flight.dto";

export class ItineraryDto {

    @IsArray()
    flight: ItineraryFlightDto[];

    @IsArray()
    accommodation: ItineraryAccommodationDto[];

    @IsArray()
    activities: [];
}