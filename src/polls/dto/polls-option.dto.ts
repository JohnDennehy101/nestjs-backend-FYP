import { IsDate, IsString } from "class-validator";


export class PollOptionDto {
    @IsString()
    title: string;
    
    @IsDate()
    startDate: string;

    @IsDate()
    endDate: string;
}