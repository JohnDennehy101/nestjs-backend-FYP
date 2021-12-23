import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from './dto/user.dto';
import { UsersRepository } from './users.repository';
import { AuthService } from 'src/auth/auth.service';
import { EmailsService } from 'src/emails/emails.service';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor (
        @InjectRepository(UsersRepository)
        private usersRepository: UsersRepository,
        private authService : AuthService,
        private emailsService: EmailsService
    ) {}

    async signUp(userDto : UserDto) : Promise<User> {
        const {password, email} = userDto;
        console.log(password);
        console.log(email);
        const hashedPassword = await this.authService.generateHashedPassword(password);
        const user = await this.usersRepository.createUser(userDto, hashedPassword);
        console.log("CREATING")
        console.log(user);
        if (user.email === email) {
            console.log("HITTING EMAIL BITY")
            const test = await this.emailsService.sendEmailConfirmationEmail(user.email);
            console.log(test);
        }
        return user;
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
