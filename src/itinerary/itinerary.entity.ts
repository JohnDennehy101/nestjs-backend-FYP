import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Event } from 'src/events/events.entity';

@Entity()
export class Itinerary {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    //Flights
    //@OneToMany(() => PollOption, (pollOption: PollOption) => pollOption.poll, {cascade: true,})
    //pollOptions: PollOption[];

    //Accommodation
    //@OneToMany(() => PollVote, (pollVote: PollVote) => pollVote.poll, {cascade: true,})
    //pollVote: PollVote[];

    @OneToOne(() => Event)
    @JoinColumn()
    event: Event;

    @Column({default: false})
    completed: boolean

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}