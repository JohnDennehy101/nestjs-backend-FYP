import { Poll } from '../polls/polls.entity';
import { User } from '../users/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { EventsType } from './events-type.enums';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ unique: true })
  title: string;
  @Column({
    type: 'enum',
    enum: EventsType,
  })
  type: string;

  @Column()
  city: string;

  @Column({ type: 'float' })
  cityLatitude: number;

  @Column({ type: 'float' })
  cityLongitude: number;

  @Column({ nullable: true })
  departureCity: string;

  @ManyToOne(() => User, (user: User) => user.createdEvents)
  createdByUser: User;

  @JoinTable({ name: 'event_invited_users' })
  @ManyToMany(() => User, (user: User) => user.invitedEvents)
  invitedUsers: User[];

  @OneToMany(() => Poll, (polls: Poll) => polls.event, { onDelete: 'CASCADE' })
  polls: Poll[];
}
