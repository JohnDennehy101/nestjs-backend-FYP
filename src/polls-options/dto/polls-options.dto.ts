import { IsDate } from "class-validator";


export class PollsOptionDto {
    @IsDate()
    startDate: string;

    @IsDate()
    endDate: string;

    votes: []

}