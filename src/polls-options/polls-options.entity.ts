import { PollVote } from '../polls-votes/polls-votes.entity';
import { Poll } from '../polls/polls.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class PollOption {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @OneToMany(() => PollVote, (pollVote: PollVote) => pollVote.pollOption)
  votes: PollVote[];

  @ApiProperty()
  @Column()
  endDate: Date;

  @ApiProperty()
  @Column()
  startDate: Date;

  @ApiProperty()
  @ManyToOne(() => Poll, (poll: Poll) => poll.pollOptions, {
    onDelete: 'CASCADE',
  })
  poll: Poll;
}
