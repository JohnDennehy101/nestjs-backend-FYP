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

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ unique: true })
  email: string;
  @Exclude()
  @Column({ nullable: true, select: false })
  password: string;

  @OneToMany(() => Event, (event: Event) => event.createdByUser)
  createdEvents: Event[];

  @OneToMany(() => PollVote, (pollVote: PollVote) => pollVote.user)
  pollVotes: PollVote[];

  @ManyToMany(() => Event, (event: Event) => event.invitedUsers)
  invitedEvents: Event[];

  @Column({ default: false })
  emailConfirmed: boolean;

  @Column({ default: null })
  profileImageUrl: string;
}
