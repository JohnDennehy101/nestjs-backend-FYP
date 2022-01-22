import { IsArray } from "class-validator";
import { ItineraryAccommodationDto } from "./itinerary.accommodation.dto";

export class ItineraryDto {

    @IsArray()
    flight: [];

    @IsArray()
    accommodation: ItineraryAccommodationDto[];

    @IsArray()
    activities: [];
}