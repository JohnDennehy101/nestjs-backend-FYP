import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Event } from 'src/events/events.entity';
import { Itinerary } from "./itinerary.entity";

@Entity()
export class ItineraryAccommodation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Itinerary, (itinerary: Itinerary) => itinerary.accommodation)
    itinerary: Itinerary;

    @Column()
    title: String

    @Column()
    bookingPreviewLink: String

    @Column()
    bookingSiteDisplayLocationMapLink: String

    @Column()
    bookingSiteLink: String

    @Column()
    freeCancellationText: String

    @Column()
    locationDistance: String

    @Column()
    numberOfBedsRecommendedBooking: String

    @Column()
    price: String

    @Column()
    ratingScore: String

    @Column()
    ratingScoreCategory: String
    
    @Column()
    reviewQuantity: String

    @Column()
    roomTypeRecommendedBooking: String

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}