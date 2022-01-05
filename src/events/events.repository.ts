import { createQueryBuilder, EntityRepository, Repository } from "typeorm";
import { EventDto } from './dto/event.dto'
import { Event } from './events.entity';
import { ConflictException, HttpException, HttpStatus, InternalServerErrorException } from "@nestjs/common";
import { User } from "src/users/user.entity";

@EntityRepository(Event)
export class EventsRepository extends Repository<Event> {
    async createEvent(eventDto : EventDto, user: User) : Promise<void> {

        try {
            //return this.eventsRepository.createEvent({...eventDto, user: userId});
            const newEvent = await this.create({...eventDto, user: user});
            await this.save(newEvent);
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

    async findAllUserEvents(user : User) : Promise<Event[]> {
        try {
            const allUserEvents = await this.find({user : user});
            return allUserEvents;
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }

    async findEvent(uuid: string) : Promise<any> {

         try {
            const event = await this.createQueryBuilder("event").leftJoinAndSelect("event.polls", "poll").where("event.id = :id", {id: uuid}).getMany() 
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