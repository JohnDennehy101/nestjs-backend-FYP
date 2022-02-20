import { IsString } from 'class-validator';

export class ItineraryAccommodationDto {
  @IsString()
  title: String;
  @IsString()
  bookingPreviewLink: String;

  @IsString()
  bookingSiteDisplayLocationMapLink: String;

  @IsString()
  bookingSiteLink: String;

  @IsString()
  freeCancellationText: String;

  @IsString()
  locationDistance: String;

  @IsString()
  numberOfBedsRecommendedBooking: String;

  @IsString()
  price: String;

  @IsString()
  ratingScore: String;

  @IsString()
  ratingScoreCategory: String;

  @IsString()
  reviewQuantity: String;

  @IsString()
  roomTypeRecommendedBooking: String;

  @IsString()
  startDate: String;

  @IsString()
  endDate: String;

  @IsString()
  locationTitle: String;

  @IsString()
  numberOfNightsAndGuests: String;

  @IsString()
  numberOfRoomsRecommendedBooking;
}
