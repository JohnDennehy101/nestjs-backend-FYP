import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventDto } from './dto/event.dto';
import { EventsRepository } from './events.repository';
import { AuthService } from 'src/auth/auth.service';

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
}
