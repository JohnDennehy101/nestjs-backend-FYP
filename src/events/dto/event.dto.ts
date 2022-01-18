import { IsArray, IsEmail, IsString } from "class-validator";

export class EventDto {
    @IsString()
    title: string;

    @IsString()
    type: string;

    @IsEmail({}, {each: true})
    userEmails: string[];

    @IsString()
    city: string;

    @IsString()
    departureCity: string;
}