import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Exclude } from 'class-transformer';
import { Event } from 'src/events/events.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({unique: true})
    email: string;
    @Exclude()
    @Column()
    password: string;

    @OneToMany(() => Event, (event: Event) => event.user)
    events: Event[];
}