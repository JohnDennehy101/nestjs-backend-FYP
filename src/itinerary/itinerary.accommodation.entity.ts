import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Event } from '../events/events.entity';
import { Itinerary } from "./itinerary.entity";

@Entity()
export class ItineraryAccommodation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Itinerary, (itinerary: Itinerary) => itinerary.accommodation, {onDelete: "CASCADE"})
    itinerary: Itinerary;

    @Column()
    title: String

    @Column()
    startDate: String

    @Column()
    endDate: String

    @Column()
    locationTitle: String

    @Column()
    numberOfNightsAndGuests: String

    @Column()
    numberOfRoomsRecommendedBooking: String

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