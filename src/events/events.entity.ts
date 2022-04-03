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
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Event {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  title: string;

  @ApiProperty()
  @Column()
  description: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: EventsType,
  })
  type: string;

  @ApiProperty()
  @Column()
  city: string;

  @ApiProperty()
  @Column({ type: 'float' })
  cityLatitude: number;

  @ApiProperty()
  @Column({ type: 'float' })
  cityLongitude: number;

  @ApiProperty()
  @Column({ nullable: true })
  departureCity: string;

  @ApiProperty()
  @ManyToOne(() => User, (user: User) => user.createdEvents)
  createdByUser: User;

  @ApiProperty()
  @JoinTable({ name: 'event_invited_users' })
  @ManyToMany(() => User, (user: User) => user.invitedEvents)
  invitedUsers: User[];

  @ApiProperty()
  @OneToMany(() => Poll, (polls: Poll) => polls.event, { onDelete: 'CASCADE' })
  polls: Poll[];
}
