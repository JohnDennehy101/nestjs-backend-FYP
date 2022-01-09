import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PollsOptionsService } from 'src/polls-options/polls-options.service';
import { PollsDto } from './dto/polls.dto';
import { PollsRepository } from './polls.repository';
import { Event } from "src/events/events.entity";

@Injectable()
export class PollsService {

    constructor (
        @InjectRepository(PollsRepository)
        private pollsRepository: PollsRepository,
        private pollsOptionsService : PollsOptionsService
        ) {}

    
     async createEventPoll(pollsDto : PollsDto, event: Event) : Promise<void> {

        try {
            //return this.eventsRepository.createEvent({...eventDto, user: userId});
            const newPoll = await this.pollsRepository.create({...pollsDto, event: event});
          
            await this.pollsRepository.save(newPoll);
            for (let option in pollsDto.options) {
                await this.pollsOptionsService.createPollOptions(pollsDto.options[option], newPoll)
            }

              console.log(newPoll);
    
          
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('Poll already exists with this title');
            }
            else {
                console.log(error)
                throw new InternalServerErrorException();
            }
        }
        
    }

    async updateEventPoll(pollDto : PollsDto, pollId : string) : Promise<any> {
        const priorPollOptions = await this.getEventPoll(pollId)
        const poll = await this.pollsRepository.findOne({id: pollId})
         if (pollDto.title) {
              await this.pollsRepository.update(pollId, {
            ...(pollDto.title && {title: pollDto.title}),
        })
         }
        await this.pollsOptionsService.updatePollOptions(pollDto.options, poll, priorPollOptions[0].pollOptions)
    }

    async deleteEventPoll(uuid: string) : Promise<any> {
        return this.pollsRepository.delete({id: uuid})
    }

    async getEventPoll(uuid: string) : Promise<any> {
        return this.pollsRepository.findPoll(uuid)
    }
    

}
