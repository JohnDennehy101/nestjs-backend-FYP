import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Event } from '../events/events.entity';
import { PollOption } from '../polls-options/polls-options.entity';
import { PollVote } from '../polls-votes/polls-votes.entity';

@Entity()
export class Poll {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ unique: true })
  title: string;

  @OneToMany(() => PollOption, (pollOption: PollOption) => pollOption.poll, {
    cascade: true,
  })
  pollOptions: PollOption[];

  @OneToMany(() => PollVote, (pollVote: PollVote) => pollVote.poll, {
    cascade: true,
  })
  pollVote: PollVote[];

  @ManyToOne(() => Event, (event: Event) => event.polls, {
    onDelete: 'CASCADE',
  })
  event: Event;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
