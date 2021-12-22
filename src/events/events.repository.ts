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

    async findAllEvents() : Promise<Event[]> {
        try {
            const allEvents = await this.find();
            return allEvents;
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }

    async findEvent(uuid: string) : Promise<Event> {

         try {
            const event = await this.findOne({id: uuid});
            return event;
        } catch (error) {
            throw new InternalServerErrorException();
        }

    }

    async findEventsByType(type: string) : Promise<Event[]> {

         try {
            const eventsWithType = await this.find({type: type});
            return eventsWithType;
        } catch (error) {
            throw new InternalServerErrorException();
        }

    }
}