import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
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
}