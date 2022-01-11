import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm'
import { Exclude } from 'class-transformer';
import { Event } from 'src/events/events.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({unique: true})
    email: string;
    @Exclude()
    @Column({nullable: true})
    password: string;

    @OneToMany(() => Event, (event: Event) => event.createdByUser)
    createdEvents: Event[];
    
    @ManyToMany(() => Event, (event: Event) => event.invitedUsers)
    invitedEvents: Event[];

    @Column({default: false})
    emailConfirmed: boolean
}