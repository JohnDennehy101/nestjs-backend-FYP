import { EntityRepository, Repository } from "typeorm";
import { EventDto } from './dto/event.dto'
import { Event } from './events.entity';
import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import { User } from "src/users/user.entity";

@EntityRepository(Event)
export class EventsRepository extends Repository<Event> {
    async createEvent(eventDto : EventDto, user: User, invitedUsers: User[]) : Promise<void> {
        let allUsers = [...invitedUsers, user]

        try {
            const newEvent = await this.create({...eventDto, createdByUser: user, invitedUsers: allUsers});
            await this.save(newEvent);
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('Event already exists with this title');
            }
            else {
                console.log(error.code)
                console.log(error)
                throw new InternalServerErrorException();
            }
        }
        
    }

    async findAllUserCreatedEvents(user : User) : Promise<Event[]> {
        try {
            const events = await this.find({createdByUser : user});
            return events;
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }

     async findAllUserInvitedEvents(user : User) : Promise<Event[]> {
        try {
            const events = await this.createQueryBuilder("event").leftJoin("event.invitedUsers", "event_invited_users").select(['event']).where("event_invited_users.id = :id", {id: user.id}).getMany()
            return events;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    async findEvent(uuid: string) : Promise<any> {

         try {
            const event = await this.createQueryBuilder("event").leftJoinAndSelect("event.polls", "poll").where("event.id = :id", {id: uuid}).leftJoinAndSelect("poll.pollOptions", "poll_option").leftJoinAndSelect("poll_option.votes", "poll_vote").leftJoinAndSelect("event.createdByUser", "user").where("event.id = :id", {id: uuid}).leftJoinAndSelect("event.invitedUsers", "event_invited_users").select(['event', 'poll', 'user.id', 'poll_option', 'poll_vote', 'event_invited_users.email', 'event_invited_users.id']).where("event.id = :id").getMany();
            return event;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }

    }

    async findEventUsers(uuid: string) : Promise<any> {
        try {
            const event = await this.createQueryBuilder("event").leftJoinAndSelect("event.polls", "poll").where("event.id = :id", {id: uuid}).leftJoinAndSelect("event.invitedUsers", "event_invited_users").select(['event', 'poll','event_invited_users']).where("event.id = :id").getMany();
            return event;
        } catch (error) {
            console.log(error);
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