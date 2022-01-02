import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventDto } from './dto/event.dto';
import { EventsRepository } from './events.repository';
import { AuthService } from 'src/auth/auth.service';
import { Event } from './events.entity';
import { ExternalApiRequestsService } from 'src/external-api-requests/external-api-requests.service';
import { User } from 'src/users/user.entity';
import { UsersRepository } from 'src/users/users.repository';
import { title } from 'process';

@Injectable()
export class EventsService {
    constructor (
        @InjectRepository(EventsRepository)
        private eventsRepository: EventsRepository,
        private usersRepository: UsersRepository,
        private authService : AuthService,
        private externalApiRequestsService : ExternalApiRequestsService
    ) {}

    async createEvent(eventDto : EventDto, userId : string) : Promise<void> {
        const user = await this.usersRepository.findOne({id: userId});
        return this.eventsRepository.createEvent(eventDto, user);
    }

    async findAllUserEvents(userId : string) : Promise<Event[]> {
        const user = await this.usersRepository.findOne({id: userId});
        return this.eventsRepository.findAllUserEvents(user);
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