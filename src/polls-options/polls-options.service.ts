import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Poll } from 'src/polls/polls.entity';
import { PollsOptionDto } from './dto/polls-options.dto';
import { PollsOptionsRepository } from './polls-options.repository';

@Injectable()
export class PollsOptionsService {

    constructor (
        @InjectRepository(PollsOptionsRepository)
        private pollsOptionsRepository: PollsOptionsRepository,
        ) {}

        async createPollOptions(pollsOptionDto : PollsOptionDto, poll: Poll) {
            const pollOption = await this.pollsOptionsRepository.create({...pollsOptionDto, poll: poll})
            let result = await this.pollsOptionsRepository.save(pollOption);
            return result;
        }

        async getPollOptions(poll: Poll) {
         
                try {
                    let pollOptions = await this.pollsOptionsRepository.find({poll: poll })
                    return pollOptions;
                }
                catch (error) {
                    console.log(error)
                }
        }

        async updatePollOptions(pollsOptionDtoArray : PollsOptionDto[], poll: Poll, priorOptions : PollsOptionDto[]) {
            
            let listOfPollOptions = []
            for (let option in pollsOptionDtoArray) {
                const individualOption = pollsOptionDtoArray[option]
             
                const pollOption = await this.pollsOptionsRepository.findOne({startDate: individualOption.startDate, endDate: individualOption.endDate, poll: poll})
                if (pollOption) {
                    await this.pollsOptionsRepository.update(pollOption.id, {  
                        ...(individualOption.endDate && {endDate: individualOption.endDate}),
                        ...(individualOption.startDate && {startDate: individualOption.startDate}),
                        //...(individualOption.votes && {votes: individualOption.votes})
                    })
                    let updatedOption = await this.pollsOptionsRepository.findOne({id: pollOption.id})
                    listOfPollOptions.push(updatedOption);
                }
                else {

                    let newOption = await this.createPollOptions(individualOption, poll);
               
                    listOfPollOptions.push(newOption);
                }
            }

             if (priorOptions.length > 0) {
           
                    for (let option in priorOptions) {
                    
                        if (pollsOptionDtoArray.filter(item => new Date(item.endDate).getTime() === new Date(priorOptions[option].endDate).getTime() && new Date(item.startDate).getTime() === new Date(priorOptions[option].startDate).getTime()).length === 0) {
                       
                            await this.pollsOptionsRepository.delete({startDate: priorOptions[option].startDate, endDate: priorOptions[option].endDate, poll: poll})
                        }
                    }
                }

                return listOfPollOptions;

        }



}
