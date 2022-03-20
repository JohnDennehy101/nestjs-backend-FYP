import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PollsOptionsService } from '../polls-options/polls-options.service';
import { PollsDto } from './dto/polls.dto';
import { PollsRepository } from './polls.repository';
import { Event } from '../events/events.entity';
import { PollsVotesService } from '../polls-votes/polls-votes.service';
import { User } from '../users/user.entity';
import { Poll } from './polls.entity';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(PollsRepository)
    private pollsRepository: PollsRepository,
    private pollsOptionsService: PollsOptionsService,
    private pollsVotesSerivce: PollsVotesService,
  ) {}

  private logger: Logger = new Logger('PollsService');

  async createEventPoll(pollsDto: PollsDto, event: Event): Promise<Poll> {
    try {
      const newPoll = await this.pollsRepository.create({
        ...pollsDto,
        event: event,
      });

    const result = await this.pollsRepository.save(newPoll);
    this.logger.log(`Poll created for event - pollId: ${result.id}`)
      for (let option in pollsDto.options) {
        await this.pollsOptionsService.createPollOptions(
          pollsDto.options[option],
          newPoll,
        );
      }

      return result;
    } catch (error) {
      if (error.code === '23505') {
        this.logger.error('Poll already exists with this title')
        throw new ConflictException('Poll already exists with this title');
      } else {
        this.logger.error(error);
        throw new InternalServerErrorException();
      }
    }
  }

  async updateEventPoll(pollDto: PollsDto, pollId): Promise<Poll> {
    let result;
    const priorPollOptions = await this.getEventPoll(pollId);
    const poll = await this.pollsRepository.findOne({ id: pollId });
    if (pollDto.title) {
      result = await this.pollsRepository.update(pollId, {
        ...(pollDto.title && { title: pollDto.title }),
      });

      this.logger.log(`Poll updated for event - pollId: ${result.id}`)
    }
    await this.pollsOptionsService.updatePollOptions(
      pollDto.options,
      poll,
      priorPollOptions.pollOptions,
    );

    return result
  }

  async voteEventPoll(
    poll: Poll,
    event: Event,
    pollVoteOptions: any[],
    user: User,
  ): Promise<any> {
    await this.pollsVotesSerivce.updatePollVotes(poll, pollVoteOptions, user);

    let eventUsers = [];

    for (let user in event.invitedUsers) {
      eventUsers.push(event.invitedUsers[user]);
    }

    let pollCompletionCheck = await this.pollsVotesSerivce.pollCompletionCheck(
      poll,
      eventUsers,
    );

    if (pollCompletionCheck) {
      await this.pollsRepository.update(poll.id, {
        completed: true,
      });

      this.logger.log(`Marking poll completed - pollId: ${poll.id}`)
    }

    return pollCompletionCheck;
  }

  async getHighestVotedPollOptions(poll) {
    return this.pollsOptionsService.getPollOptionsWithMostVotes(poll);
  }

  async deleteEventPoll(uuid: string): Promise<any> {
    this.logger.log(`Deleting poll - id: ${uuid}`);
    return this.pollsRepository.delete({ id: uuid });
  }

  async getEventPoll(uuid: string): Promise<any> {
    //Update query to only return user votes and hide certain fields like passworde
    let poll = await this.pollsRepository.findPoll(uuid);

    this.logger.log(`Finding poll - id: ${uuid}`);

    for (let vote in poll.pollVote) {
      poll.pollVote[vote] = {
        id: poll.pollVote[vote].id,
        userId: poll.pollVote[vote].user.id,
        pollOptionId: poll.pollVote[vote].pollOption.id,
      };
    }

    for (let pollOption in poll.pollOptions) {
      poll.pollOptions[pollOption]['votes'] = poll.pollVote.filter(
        (vote) => vote.pollOptionId === poll.pollOptions[pollOption].id,
      ).length;
    }

    return poll;
  }
  async returnIndividualPoll(uuid: string): Promise<any> {
    this.logger.log(`Finding individual poll - id: ${uuid}`)
    return this.pollsRepository.findOne({ id: uuid });
  }
}
