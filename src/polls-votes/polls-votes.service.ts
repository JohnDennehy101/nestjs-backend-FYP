import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PollOption } from '../polls-options/polls-options.entity';
import { Poll } from '../polls/polls.entity';
import { User } from '../users/user.entity';
import { PollsVotesRepository } from './polls-votes.repository';

@Injectable()
export class PollsVotesService {

    constructor (
        @InjectRepository(PollsVotesRepository)
        private pollsVotesRepository: PollsVotesRepository,
        ) {}

        async updatePollVotes(poll: Poll, pollOptions : PollOption[], user : User) {

           let previousPollOptionVoteIdList = []
           let newPolloptionVoteIdList = []

             let previousPollVotes = await this.pollsVotesRepository.find({user: user, poll: poll})

             if (previousPollVotes.length > 0) {

                 for (let vote in previousPollVotes) {

                  const pollVote = await this.pollsVotesRepository.findOne(previousPollVotes[vote].id, { relations: ['pollOption'] });

                  previousPollOptionVoteIdList.push(pollVote.id);

                 }


             }
           

            for (let option in pollOptions) {
                try {
                    let existingRecordCheck = await this.pollsVotesRepository.findOne({pollOption: pollOptions[option], user: user, poll: poll})


                if (!existingRecordCheck) {
                        let newRecord = await this.pollsVotesRepository.create({pollOption: pollOptions[option], user: user, poll: poll})
                        newPolloptionVoteIdList.push(newRecord.id)
                        await this.pollsVotesRepository.save(newRecord);

                }
                else {
                       newPolloptionVoteIdList.push(existingRecordCheck.id) 
                }
                    }
                catch (error) {
                    console.log(error)
                }
                
            }

            for (let id in previousPollOptionVoteIdList) {

                if (!newPolloptionVoteIdList.includes(previousPollOptionVoteIdList[id])) {
                    await  this.pollsVotesRepository.delete({id: previousPollOptionVoteIdList[id]})
                }

            }

        }

        async pollCompletionCheck (poll: Poll, eventUsers: User[]) {
            let allUserSubmissions = true;

            for (let user in eventUsers) {
                     let userSubmissionCheck = await this.pollsVotesRepository.find({poll: poll, user: eventUsers[user]})

                     if (userSubmissionCheck.length === 0) {
                         allUserSubmissions = false;
                         break;
                     }
            }

            return allUserSubmissions;
        }

    
    


}
