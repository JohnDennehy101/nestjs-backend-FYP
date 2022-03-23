import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Event } from '../events/events.entity';
import { PollVote } from '../polls-votes/polls-votes.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Exclude()
  @Column({ nullable: true, select: false })
  password: string;

  @ApiProperty()
  @OneToMany(() => Event, (event: Event) => event.createdByUser)
  createdEvents: Event[];

  @ApiProperty()
  @OneToMany(() => PollVote, (pollVote: PollVote) => pollVote.user)
  pollVotes: PollVote[];

  @ApiProperty()
  @ManyToMany(() => Event, (event: Event) => event.invitedUsers)
  invitedEvents: Event[];

  @ApiProperty()
  @Column({ default: false })
  emailConfirmed: boolean;

  @ApiProperty()
  @Column({ default: false })
  passwordProvided: boolean;

  @ApiProperty()
  @Column({ default: null })
  profileImageUrl: string;
}
