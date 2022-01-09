import { EntityRepository, Repository } from "typeorm";
import { PollOption } from "./polls-options.entity";


@EntityRepository(PollOption)
export class PollsOptionsRepository extends Repository<PollOption> {
  

}