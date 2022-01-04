import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import { Event } from "src/events/events.entity";
import { EntityRepository, Repository } from "typeorm";
import { PollOptionDto } from "./dto/polls-option.dto";
import { PollsDto } from "./dto/polls.dto";
import { Poll } from "./polls.entity";


@EntityRepository(Poll)
export class PollsRepository extends Repository<Poll> {
    async createEventPoll(pollsDto : PollsDto, event: Event) : Promise<void> {

        try {
            //return this.eventsRepository.createEvent({...eventDto, user: userId});
            const newPoll = await this.create({...pollsDto, event: event});
            await this.save(newPoll);
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('Poll already exists with this title');
            }
            else {
                console.log(error.code)
                throw new InternalServerErrorException();
            }
        }
        
    }

}