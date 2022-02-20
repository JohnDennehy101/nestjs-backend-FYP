import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Event } from '../events/events.entity';
import { ItineraryAccommodation } from "./itinerary.accommodation.entity";
import { ItineraryFlight } from "./itinerary.flight.entity";
import { ItineraryActivity } from "./itinerary.activity.entity";

@Entity()
export class Itinerary {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToMany(() => ItineraryFlight, (flight: ItineraryFlight) => flight.itinerary, {onDelete: "CASCADE"})
    flight: ItineraryFlight[];

    @OneToMany(() => ItineraryAccommodation, (accommodation: ItineraryAccommodation) => accommodation.itinerary, {onDelete: "CASCADE"})
    accommodation: ItineraryAccommodation[];

    @OneToMany(() => ItineraryActivity, (activities: ItineraryActivity) => activities.itinerary, {onDelete: "CASCADE"})
    activities: ItineraryActivity[];

    @OneToOne(() => Event, {onDelete: "CASCADE"})
    @JoinColumn()
    event: Event;

    @Column({default: false})
    completed: boolean

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}