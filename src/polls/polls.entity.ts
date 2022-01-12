import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Event } from 'src/events/events.entity';
import { PollOption } from "src/polls-options/polls-options.entity";
import { PollVote } from "src/polls-votes/polls-votes.entity";


@Entity()
export class Poll {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({unique: true})
    title: string;

    @OneToMany(() => PollOption, (pollOption: PollOption) => pollOption.poll, {cascade: true,})
    pollOptions: PollOption[];

    @OneToMany(() => PollVote, (pollVote: PollVote) => pollVote.poll, {cascade: true,})
    pollVote: PollVote[];

    @ManyToOne(() => Event, (event: Event) => event.polls)
    event: Event;
}