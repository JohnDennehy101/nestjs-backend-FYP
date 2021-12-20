import { EntityRepository, Repository } from "typeorm";
import { AuthSignupDto } from "./dto/auth-signup-dto";
import { User } from './user.entity'

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
    async createUser(AuthSignupDto : AuthSignupDto) : Promise<void> {
        const {username, password} = AuthSignupDto;
        const user = this.create({username, password})
        await this.save(user);
    }
}