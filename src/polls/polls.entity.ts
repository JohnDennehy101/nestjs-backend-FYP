import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Event } from 'src/events/events.entity';


@Entity()
export class Poll {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({unique: true})
    title: string;

    @Column('jsonb', {nullable: true})
    options?: object[];

    @ManyToOne(() => Event, (event: Event) => event.polls)
    event: Event;
}