import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PollsDto } from './dto/polls.dto';
import { PollsRepository } from './polls.repository';

@Injectable()
export class PollsService {

    constructor (
        @InjectRepository(PollsRepository)
        private pollsRepository: PollsRepository,
        ) {}

    async updateEventPoll(pollDto : PollsDto, pollId : string) : Promise<any> {
        return this.pollsRepository.update(pollId, {
            ...(pollDto.title && {title: pollDto.title}),
            ...(pollDto.options && {options: pollDto.options})
        })
    }
    

}
