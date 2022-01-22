import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ItineraryDto } from './dto/itinerary.dto';
import { ItineraryRepository } from './itinerary.repository';
import { Event } from 'src/events/events.entity';
import { ItineraryAccommodationRepository } from './itinerary.accommodation.repository';

@Injectable()
export class ItineraryService {
    constructor(@InjectRepository(ItineraryRepository) private itineraryRepository: ItineraryRepository, @InjectRepository(ItineraryAccommodationRepository) private itineraryAccommodationRepository: ItineraryAccommodationRepository) {}


        async createEventItinerary(itineraryDto : ItineraryDto, event: Event) : Promise<void> {

        try {
            const {accommodation } = itineraryDto

            const newItinerary = await this.itineraryRepository.create({event: event});

            await this.itineraryRepository.save(newItinerary);

            const accommodationDbEntry = await this.itineraryAccommodationRepository.create({
                title: accommodation[0].title,
                bookingPreviewLink: accommodation[0].bookingPreviewLink,
                bookingSiteDisplayLocationMapLink: accommodation[0].bookingSiteDisplayLocationMapLink,
                bookingSiteLink: accommodation[0].bookingSiteLink,
                freeCancellationText: accommodation[0].freeCancellationText,
                locationDistance: accommodation[0].locationDistance,
                numberOfBedsRecommendedBooking: accommodation[0].numberOfBedsRecommendedBooking,
                price: accommodation[0].price,
                ratingScore: accommodation[0].ratingScore,
                ratingScoreCategory: accommodation[0].ratingScoreCategory,
                reviewQuantity: accommodation[0].reviewQuantity,
                roomTypeRecommendedBooking: accommodation[0].roomTypeRecommendedBooking,
                itinerary: newItinerary
            })

            await this.itineraryAccommodationRepository.save(accommodationDbEntry);
          
            
    
          
        } catch (error) {
                console.log(error)
                throw new InternalServerErrorException()
        }
        
    }
}
