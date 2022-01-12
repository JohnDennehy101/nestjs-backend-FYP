import { PollOption } from "src/polls-options/polls-options.entity";
import { Poll } from "src/polls/polls.entity";
import { User } from "src/users/user.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class PollVote {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user: User) => user.pollVotes, {onDelete: "CASCADE"})
    user: User;

    @ManyToOne(() => PollOption, (pollOption: PollOption) => pollOption.votes, {onDelete: "CASCADE"})
    pollOption: PollOption;

    @ManyToOne(() => Poll, (poll: Poll) => poll.pollVote, {onDelete: "CASCADE"})
    poll: Poll;

}