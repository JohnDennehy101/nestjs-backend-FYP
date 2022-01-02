import { User } from 'src/users/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { EventsType } from './events-type.enums';

@Entity()
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({unique: true})
    title: string;
    @Column({
        type: 'enum',
        enum: EventsType
    })
    type: string;
    @ManyToOne(() => User, (user: User) => user.events)
    user: User;
}