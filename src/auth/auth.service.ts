import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthSignupDto } from './dto/auth-signup-dto';
import { User } from './user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class AuthService {
    constructor (
        @InjectRepository(UsersRepository)
        private usersRepository: UsersRepository
    ) {}

    async signUp(authSignupDto : AuthSignupDto) : Promise<void> {
        return this.usersRepository.createUser(authSignupDto)
    }
}
