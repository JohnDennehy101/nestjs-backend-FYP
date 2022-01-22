import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ItineraryDto } from './dto/itinerary.dto';
import { ItineraryRepository } from './itinerary.repository';
import { Event } from 'src/events/events.entity';

@Injectable()
export class ItineraryService {
    constructor(@InjectRepository(ItineraryRepository) private itineraryRepository: ItineraryRepository,) {}


        async createEventItinerary(itineraryDto : ItineraryDto, event: Event) : Promise<void> {

        try {
            //return this.eventsRepository.createEvent({...eventDto, user: userId});
            console.log(event);
            const newItinerary = await this.itineraryRepository.create({event: event});
          
            await this.itineraryRepository.save(newItinerary);
    
          
        } catch (error) {
                console.log(error)
                throw new InternalServerErrorException()
        }
        
    }
}
