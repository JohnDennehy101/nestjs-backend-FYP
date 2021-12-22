import { EntityRepository, Repository } from "typeorm";
import { EventDto } from './dto/event.dto'
import { Event } from './events.entity';
import { ConflictException, HttpException, HttpStatus, InternalServerErrorException } from "@nestjs/common";

@EntityRepository(Event)
export class EventsRepository extends Repository<Event> {
    async createEvent(eventDto : EventDto) : Promise<void> {

        try {
            await this.save(eventDto);
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('Event already exists with this title');
            }
            else {
                console.log(error.code)
                throw new InternalServerErrorException();
            }
        }
        
    }
}