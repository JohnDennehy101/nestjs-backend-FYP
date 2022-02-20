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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Itinerary, (itinerary: Itinerary) => itinerary.activities, {
    onDelete: 'CASCADE',
  })
  itinerary: Itinerary;

  @Column()
  name: String;

  @Column()
  vicinity: String;

  @Column()
  rating: String;

  @Column()
  user_ratings_total: String;

  @Column()
  mapLink: String;

  @Column()
  placesId: String;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
