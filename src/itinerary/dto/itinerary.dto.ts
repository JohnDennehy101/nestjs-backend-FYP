import { IsArray, IsBoolean } from "class-validator";
import { ItineraryAccommodationDto } from "./itinerary.accommodation.dto";
import { ItineraryActivityDto } from "./itinerary.activity.dto";
import { ItineraryFlightDto } from "./itinerary.flight.dto";

export class ItineraryDto {

    @IsArray()
    flight: ItineraryFlightDto[];

    @IsArray()
    accommodation: ItineraryAccommodationDto[];

    @IsArray()
    activities: ItineraryActivityDto[];

    @IsBoolean()
    completed: boolean
}