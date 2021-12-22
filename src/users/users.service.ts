import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from './dto/user.dto';
import { UsersRepository } from './users.repository';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UsersService {
    constructor (
        @InjectRepository(UsersRepository)
        private usersRepository: UsersRepository,
        private authService : AuthService
    ) {}

    async signUp(userDto : UserDto) : Promise<void> {
        const {password} = userDto;
        const hashedPassword = await this.authService.generateHashedPassword(password);
        return this.usersRepository.createUser(userDto, hashedPassword);
    }

    async login(userDto : UserDto) : Promise<{jwtToken: string}> {
        const {email, password} = userDto;
        const user = await this.usersRepository.findOne({email});

        if (user && await this.authService.validatePasswordLogin(password, user.password)) {
            const jwtToken = await this.authService.createJwtToken(email);
            return jwtToken;
        } else {
            throw new UnauthorizedException('No existing account found with these credentials');
        }
    }
}
