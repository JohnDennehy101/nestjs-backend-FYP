import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventDto } from './dto/event.dto';
import { EventsRepository } from './events.repository';
import { AuthService } from 'src/auth/auth.service';
import { Event } from './events.entity';

@Injectable()
export class EventsService {
    constructor (
        @InjectRepository(EventsRepository)
        private eventsRepository: EventsRepository,
        private authService : AuthService
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
}
