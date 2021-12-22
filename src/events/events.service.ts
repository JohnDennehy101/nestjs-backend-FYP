import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventDto } from './dto/event.dto';
import { EventsRepository } from './events.repository';
import { AuthService } from 'src/auth/auth.service';
import { Event } from './events.entity';
import { ExternalApiRequestsService } from 'src/external-api-requests/external-api-requests.service';

@Injectable()
export class EventsService {
    constructor (
        @InjectRepository(EventsRepository)
        private eventsRepository: EventsRepository,
        private authService : AuthService,
        private externalApiRequestsService : ExternalApiRequestsService
    ) {}

    async createEvent(eventDto : EventDto) : Promise<void> {
        return this.eventsRepository.createEvent(eventDto);
    }

    async findAllEvents() : Promise<Event[]> {
        return this.eventsRepository.findAllEvents();
    }

    async findEvent(uuid: string) : Promise<Event> {
        return this.eventsRepository.findEvent(uuid);
    }

    async findEventsByType(type: string) : Promise<Event[]> {
        return this.eventsRepository.findEventsByType(type);
    }

    async findAccommodationInformation() : Promise<any> {
        /*return this.externalApiRequestsService.getAccommodationInfo('Dublin', new Date, new Date,5,1,'')*/

        /*return this.externalApiRequestsService.getFlightInfo('Dublin', 'London', new Date, new Date, 3, '')*/
        /*return this.externalApiRequestsService.getThirdPartyJwt()*/
    }
}
