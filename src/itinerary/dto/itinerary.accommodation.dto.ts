import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ItineraryAccommodationDto {

  @ApiProperty({type: 'string'})
  @IsString()
  title: String;

  @ApiProperty({type: 'string'})
  @IsString()
  bookingPreviewLink: String;

  @ApiProperty({type: 'string'})
  @IsString()
  bookingSiteDisplayLocationMapLink: String;

  @ApiProperty({type: 'string'})
  @IsString()
  bookingSiteLink: String;

  @ApiProperty({type: 'string'})
  @IsString()
  freeCancellationText: String;

  @ApiProperty({type: 'string'})
  @IsString()
  locationDistance: String;

  @ApiProperty({type: 'string'})
  @IsString()
  numberOfBedsRecommendedBooking: String;

  @ApiProperty({type: 'string'})
  @IsString()
  price: String;

  @ApiProperty({type: 'string'})
  @IsString()
  ratingScore: String;

  @ApiProperty({type: 'string'})
  @IsString()
  ratingScoreCategory: String;

  @ApiProperty({type: 'string'})
  @IsString()
  reviewQuantity: String;

  @ApiProperty({type: 'string'})
  @IsString()
  roomTypeRecommendedBooking: String;

  @ApiProperty({type: 'string'})
  @IsString()
  startDate: String;

  @ApiProperty({type: 'string'})
  @IsString()
  endDate: String;

  @ApiProperty({type: 'string'})
  @IsString()
  locationTitle: String;

  @ApiProperty({type: 'string'})
  @IsString()
  numberOfNightsAndGuests: String;

  @ApiProperty({type: 'string'})
  @IsString()
  numberOfRoomsRecommendedBooking;
}
