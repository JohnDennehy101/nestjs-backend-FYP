import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PollsOptionsService } from 'src/polls-options/polls-options.service';
import { PollsDto } from './dto/polls.dto';
import { PollsRepository } from './polls.repository';
import { Event } from "src/events/events.entity";
import { PollsVotesService } from 'src/polls-votes/polls-votes.service';
import { User } from 'src/users/user.entity';
import { PollOptionDto } from './dto/polls-option.dto';
import { PollOption } from 'src/polls-options/polls-options.entity';
import { Poll } from './polls.entity';

@Injectable()
export class PollsService {

    constructor (
        @InjectRepository(PollsRepository)
        private pollsRepository: PollsRepository,
        private pollsOptionsService : PollsOptionsService,
        private pollsVotesSerivce: PollsVotesService
        ) {}

    
     async createEventPoll(pollsDto : PollsDto, event: Event) : Promise<void> {

        try {
            //return this.eventsRepository.createEvent({...eventDto, user: userId});
            const newPoll = await this.pollsRepository.create({...pollsDto, event: event});
          
            await this.pollsRepository.save(newPoll);
            for (let option in pollsDto.options) {
                await this.pollsOptionsService.createPollOptions(pollsDto.options[option], newPoll)
            }
    
          
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

    async updateEventPoll(pollDto : PollsDto, pollId) : Promise<any> {
        const priorPollOptions = await this.getEventPoll(pollId)
        const poll = await this.pollsRepository.findOne({id: pollId})
         if (pollDto.title) {
              await this.pollsRepository.update(pollId, {
            ...(pollDto.title && {title: pollDto.title}),
        })
         }
        await this.pollsOptionsService.updatePollOptions(pollDto.options, poll, priorPollOptions[0].pollOptions)
    }

    async voteEventPoll(poll: Poll, pollVoteOptions : any[], user : User) : Promise<any> {

        await this.pollsVotesSerivce.updatePollVotes(poll, pollVoteOptions, user);
    }

    async deleteEventPoll(uuid: string) : Promise<any> {
        return this.pollsRepository.delete({id: uuid})
    }

    async getEventPoll(uuid: string) : Promise<any> {
        //Update query to only return user votes and hide certain fields like passworde
        let poll = await this.pollsRepository.findPoll(uuid);

        console.log(poll);

        for (let vote in poll.pollVote) {
            poll.pollVote[vote] = {
                "id": poll.pollVote[vote].id,
                "userId": poll.pollVote[vote].user.id,
                "pollOptionId": poll.pollVote[vote].pollOption.id
            }
        }

        for (let pollOption in poll.pollOptions) {
            poll.pollOptions[pollOption]["votes"] = poll.pollVote.filter((vote) => vote.pollOptionId === poll.pollOptions[pollOption].id).length
        }

        return poll;
    }
    async returnIndividualPoll(uuid: string) : Promise<any> {
       return this.pollsRepository.findOne({id: uuid});
    }
    

}
