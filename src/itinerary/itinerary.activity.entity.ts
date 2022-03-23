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
export class ItineraryActivity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @ManyToOne(() => Itinerary, (itinerary: Itinerary) => itinerary.activities, {
    onDelete: 'CASCADE',
  })
  itinerary: Itinerary;

  @ApiProperty()
  @Column()
  name: String;

  @ApiProperty()
  @Column()
  vicinity: String;

  @ApiProperty()
  @Column()
  rating: String;

  @ApiProperty()
  @Column()
  user_ratings_total: String;

  @ApiProperty()
  @Column()
  mapLink: String;

  @ApiProperty()
  @Column()
  placesId: String;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}
