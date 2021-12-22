import { IsString } from "class-validator";

export class EventDto {
    @IsString()
    title: string;

    @IsString()
    type: string;
}