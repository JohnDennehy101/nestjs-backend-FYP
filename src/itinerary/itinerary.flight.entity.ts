import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Itinerary } from "./itinerary.entity";

@Entity()
export class ItineraryFlight {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Itinerary, (itinerary: Itinerary) => itinerary.flight, {onDelete: "CASCADE"})
    itinerary: Itinerary;

    @Column()
    departureTime: String

    @Column()
    arrivalTime: String

    @Column()
    departureCity: String

    @Column()
    arrivalCity: String

    @Column()
    airport: String

    @Column()
    duration: String

    @Column()
    directFlight: String

    @Column()
    carrier: String

    @Column()
    pricePerPerson: String
    
    @Column()
    priceTotal: String

    @Column()
    flightUrl: String

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}