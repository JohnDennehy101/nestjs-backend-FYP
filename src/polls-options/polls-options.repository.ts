import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { PollOption } from './polls-options.entity';

@EntityRepository(PollOption)
export class PollsOptionsRepository extends Repository<PollOption> {
  async getPollOptionsWithMostVotes(pollId: string): Promise<any> {
    try {
      const pollOptions = await this.createQueryBuilder('poll_option')
        .leftJoinAndSelect('poll_option.votes', 'poll_vote')
        .where('poll_vote.pollId = :id', { id: pollId })
        .getMany();

      let maxVote = 0;
      let highestVotedPollOptions = [];

      for (let option in pollOptions) {
        if (pollOptions[option].votes.length > maxVote) {
          highestVotedPollOptions = [];
          maxVote = pollOptions[option].votes.length;
          highestVotedPollOptions.push(pollOptions[option]);
        } else if (pollOptions[option].votes.length === maxVote) {
          highestVotedPollOptions.push(pollOptions[option]);
        }
      }
      return highestVotedPollOptions;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
