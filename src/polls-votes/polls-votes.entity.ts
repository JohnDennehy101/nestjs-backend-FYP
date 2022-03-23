import { PollOption } from '../polls-options/polls-options.entity';
import { Poll } from '../polls/polls.entity';
import { User } from '../users/user.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class PollVote {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @ManyToOne(() => User, (user: User) => user.pollVotes, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ApiProperty()
  @ManyToOne(() => PollOption, (pollOption: PollOption) => pollOption.votes, {
    onDelete: 'CASCADE',
  })
  pollOption: PollOption;

  @ApiProperty()
  @ManyToOne(() => Poll, (poll: Poll) => poll.pollVote, { onDelete: 'CASCADE' })
  poll: Poll;
}
