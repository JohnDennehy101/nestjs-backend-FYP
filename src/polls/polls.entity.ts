import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ unique: true })
  title: string;

  @ApiProperty()
  @OneToMany(() => PollOption, (pollOption: PollOption) => pollOption.poll, {
    cascade: true,
  })
  pollOptions: PollOption[];

  @ApiProperty()
  @OneToMany(() => PollVote, (pollVote: PollVote) => pollVote.poll, {
    cascade: true,
  })
  pollVote: PollVote[];

  @ApiProperty()
  @ManyToOne(() => Event, (event: Event) => event.polls, {
    onDelete: 'CASCADE',
  })
  event: Event;

  @ApiProperty()
  @Column({ default: false })
  completed: boolean;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}
