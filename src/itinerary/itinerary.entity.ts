import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Event } from 'src/events/events.entity';
import { ItineraryAccommodation } from "./itinerary.accommodation.entity";

@Entity()
export class Itinerary {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    //Flights
    //@OneToMany(() => PollOption, (pollOption: PollOption) => pollOption.poll, {cascade: true,})
    //pollOptions: PollOption[];

    @OneToMany(() => ItineraryAccommodation, (accommodation: ItineraryAccommodation) => accommodation.itinerary, {onDelete: "CASCADE"})
    accommodation: ItineraryAccommodation[];

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