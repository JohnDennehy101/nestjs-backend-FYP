import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Itinerary } from './itinerary.entity';

@Entity()
export class ItineraryFlight {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @ManyToOne(() => Itinerary, (itinerary: Itinerary) => itinerary.flight, {
    onDelete: 'CASCADE',
  })
  itinerary: Itinerary;

  @ApiProperty()
  @Column()
  departureTime: String;

  @ApiProperty()
  @Column()
  arrivalTime: String;

  @ApiProperty()
  @Column()
  departureCity: String;

  @ApiProperty()
  @Column()
  arrivalCity: String;

  @ApiProperty()
  @Column()
  airport: String;

  @ApiProperty()
  @Column()
  duration: String;

  @ApiProperty()
  @Column()
  directFlight: String;

  @ApiProperty()
  @Column()
  carrier: String;

  @ApiProperty()
  @Column()
  pricePerPerson: String;

  @ApiProperty()
  @Column()
  priceTotal: String;

  @ApiProperty()
  @Column()
  flightUrl: String;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}
