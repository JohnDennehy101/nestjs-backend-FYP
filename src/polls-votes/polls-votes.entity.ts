import { PollOption } from '../polls-options/polls-options.entity';
import { Poll } from '../polls/polls.entity';
import { User } from '../users/user.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PollVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user: User) => user.pollVotes, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => PollOption, (pollOption: PollOption) => pollOption.votes, {
    onDelete: 'CASCADE',
  })
  pollOption: PollOption;

  @ManyToOne(() => Poll, (poll: Poll) => poll.pollVote, { onDelete: 'CASCADE' })
  poll: Poll;
}
