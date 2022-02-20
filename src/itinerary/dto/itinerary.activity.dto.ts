import { IsString } from 'class-validator';

export class ItineraryActivityDto {
  @IsString()
  name: String;
  @IsString()
  vicinity: String;
  @IsString()
  rating: String;
  @IsString()
  user_ratings_total: String;
  @IsString()
  mapLink: String;
  @IsString()
  placesId: String;
}
