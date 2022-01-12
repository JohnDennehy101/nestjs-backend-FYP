import { InternalServerErrorException } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm";
import { PollVote } from "./polls-votes.entity";


@EntityRepository(PollVote)
export class PollsVotesRepository extends Repository<PollVote> {


}