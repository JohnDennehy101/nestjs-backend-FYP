import { IsArray } from "class-validator";

export class ItineraryDto {

    @IsArray()
    flight: [];

    @IsArray()
    accommodation: [];

    @IsArray()
    activities: [];
}