import { Poll } from "src/polls/polls.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PollOption {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column('text', {array: true})
    votes: string[];
    @Column()
    endDate: Date;
    @Column()
    startDate: Date;

    @ManyToOne(() => Poll, (poll: Poll) => poll.pollOptions, {onDelete: "CASCADE"})
    poll: Poll;
}