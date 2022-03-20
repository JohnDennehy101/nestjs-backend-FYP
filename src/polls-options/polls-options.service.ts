import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Poll } from '../polls/polls.entity';
import { PollsOptionDto } from './dto/polls-options.dto';
import { PollsOptionsRepository } from './polls-options.repository';

@Injectable()
export class PollsOptionsService {
  constructor(
    @InjectRepository(PollsOptionsRepository)
    private pollsOptionsRepository: PollsOptionsRepository,
  ) {}

  private logger: Logger = new Logger('PollsOptionsService');

  async createPollOptions(pollsOptionDto: PollsOptionDto, poll: Poll) {
    const pollOption = await this.pollsOptionsRepository.create({
      ...pollsOptionDto,
      poll: poll,
    });
    let result = await this.pollsOptionsRepository.save(pollOption);
    this.logger.log(`Creating Poll Option - id: ${result.id}`)
    return result;
  }

  async getPollOptions(poll: Poll) {
    try {
      let pollOptions = await this.pollsOptionsRepository.find({ poll: poll });
      this.logger.log(`Getting poll options for poll - id: ${poll.id}`)
      return pollOptions;
    } catch (error) {
      console.log(error);
    }
  }

  async updatePollOptions(
    pollsOptionDtoArray: PollsOptionDto[],
    poll: Poll,
    priorOptions: PollsOptionDto[],
  ) {
    let listOfPollOptions = [];
    for (let option in pollsOptionDtoArray) {
      const individualOption = pollsOptionDtoArray[option];

      const pollOption = await this.pollsOptionsRepository.findOne({
        startDate: individualOption.startDate,
        endDate: individualOption.endDate,
        poll: poll,
      });
      if (pollOption) {
        await this.pollsOptionsRepository.update(pollOption.id, {
          ...(individualOption.endDate && {
            endDate: individualOption.endDate,
          }),
          ...(individualOption.startDate && {
            startDate: individualOption.startDate,
          }),
        });
        let updatedOption = await this.pollsOptionsRepository.findOne({
          id: pollOption.id,
        });

        this.logger.log(`Updating existing poll option - id: ${pollOption.id}`)
        listOfPollOptions.push(updatedOption);
      } else {
        let newOption = await this.createPollOptions(individualOption, poll);

        listOfPollOptions.push(newOption);
      }
    }

    if (priorOptions.length > 0) {
      for (let option in priorOptions) {
        if (
          pollsOptionDtoArray.filter(
            (item) =>
              new Date(item.endDate).getTime() ===
                new Date(priorOptions[option].endDate).getTime() &&
              new Date(item.startDate).getTime() ===
                new Date(priorOptions[option].startDate).getTime(),
          ).length === 0
        ) {
          await this.pollsOptionsRepository.delete({
            startDate: priorOptions[option].startDate,
            endDate: priorOptions[option].endDate,
            poll: poll,
          });

          this.logger.log(`Deleting poll option as no longer in use - startDate: ${priorOptions[option].startDate}, endDate: ${priorOptions[option].endDate}, pollId: ${poll.id}`)
        }
      }
    }

    return listOfPollOptions;
  }

  async getPollOptionsWithMostVotes(poll: Poll) {
    this.logger.log(`Getting most voted poll options for poll - id: ${poll.id}`)
    return this.pollsOptionsRepository.getPollOptionsWithMostVotes(poll.id);
  }
}
