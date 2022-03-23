import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Event } from '../events/events.entity';
import { ItineraryAccommodation } from './itinerary.accommodation.entity';
import { ItineraryFlight } from './itinerary.flight.entity';
import { ItineraryActivity } from './itinerary.activity.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Itinerary {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @OneToMany(
    () => ItineraryFlight,
    (flight: ItineraryFlight) => flight.itinerary,
    { onDelete: 'CASCADE' },
  )
  flight: ItineraryFlight[];

  @ApiProperty()
  @OneToMany(
    () => ItineraryAccommodation,
    (accommodation: ItineraryAccommodation) => accommodation.itinerary,
    { onDelete: 'CASCADE' },
  )
  accommodation: ItineraryAccommodation[];

  @ApiProperty()
  @OneToMany(
    () => ItineraryActivity,
    (activities: ItineraryActivity) => activities.itinerary,
    { onDelete: 'CASCADE' },
  )
  activities: ItineraryActivity[];

  @ApiProperty()
  @OneToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn()
  event: Event;

  @ApiProperty()
  @Column({ default: false })
  completed: boolean;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}
