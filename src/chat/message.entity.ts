import { Event } from '../events/events.entity';
import { User } from '../users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  content: string;

  @ManyToOne(() => User)
  author: User;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  event: Event;

  @CreateDateColumn()
  created_at: Date;
}
