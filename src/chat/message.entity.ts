import { Event } from "src/events/events.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column()
    content: string;

    @ManyToOne(() => User)
    author: User;

    @ManyToOne(() => Event)
    event: Event;
}