import { IsDate, IsString } from "class-validator";


export class PollOptionDto {
  
    
    @IsDate()
    startDate: string;

    @IsDate()
    endDate: string;
}