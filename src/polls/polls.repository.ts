import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import { Event } from "src/events/events.entity";
import { EntityRepository, Repository } from "typeorm";
import { PollOptionDto } from "./dto/polls-option.dto";
import { PollsDto } from "./dto/polls.dto";
import { Poll } from "./polls.entity";


@EntityRepository(Poll)
export class PollsRepository extends Repository<Poll> {
   async findPoll(uuid: string) : Promise<any> {

         try {
            const poll = await this.findOne(uuid, { relations: ['event', 'pollOptions', 'pollVote', 'pollVote.user', 'pollVote.pollOption'] });
            return poll;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }

    }

}