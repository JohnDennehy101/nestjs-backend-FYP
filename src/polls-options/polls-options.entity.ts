import { PollVote } from '../polls-votes/polls-votes.entity';
import { Poll } from '../polls/polls.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class PollOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @OneToMany(() => PollVote, (pollVote: PollVote) => pollVote.pollOption)
  votes: PollVote[];

  @Column()
  endDate: Date;
  @Column()
  startDate: Date;

  @ManyToOne(() => Poll, (poll: Poll) => poll.pollOptions, {
    onDelete: 'CASCADE',
  })
  poll: Poll;
}
