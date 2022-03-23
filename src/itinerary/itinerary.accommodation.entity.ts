import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Event } from '../events/events.entity';
import { Itinerary } from './itinerary.entity';

@Entity()
export class ItineraryAccommodation {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @ManyToOne(
    () => Itinerary,
    (itinerary: Itinerary) => itinerary.accommodation,
    { onDelete: 'CASCADE' },
  )
  itinerary: Itinerary;

  @ApiProperty()
  @Column()
  title: String;

  @ApiProperty()
  @Column()
  startDate: String;

  @ApiProperty()
  @Column()
  endDate: String;

  @ApiProperty()
  @Column()
  locationTitle: String;

  @ApiProperty()
  @Column()
  numberOfNightsAndGuests: String;

  @ApiProperty()
  @Column()
  numberOfRoomsRecommendedBooking: String;

  @ApiProperty()
  @Column()
  bookingPreviewLink: String;

  @ApiProperty()
  @Column()
  bookingSiteDisplayLocationMapLink: String;

  @ApiProperty()
  @Column()
  bookingSiteLink: String;

  @ApiProperty()
  @Column()
  freeCancellationText: String;

  @ApiProperty()
  @Column()
  locationDistance: String;

  @ApiProperty()
  @Column()
  numberOfBedsRecommendedBooking: String;

  @ApiProperty()
  @Column()
  price: String;

  @ApiProperty()
  @Column()
  ratingScore: String;

  @ApiProperty()
  @Column()
  ratingScoreCategory: String;

  @ApiProperty()
  @Column()
  reviewQuantity: String;

  @ApiProperty()
  @Column()
  roomTypeRecommendedBooking: String;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}
