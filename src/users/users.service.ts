import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from './dto/user.dto';
import { UsersRepository } from './users.repository';
import { AuthService } from 'src/auth/auth.service';
import { EmailsService } from 'src/emails/emails.service';
import { UserResponseDto } from './dto/user.response.dto';

@Injectable()
export class UsersService {
    constructor (
        @InjectRepository(UsersRepository)
        private usersRepository: UsersRepository,
        private authService : AuthService,
        private emailsService: EmailsService
    ) {}

    async signUp(userDto : UserDto) : Promise<UserResponseDto> {
        const {password, email} = userDto;
        console.log(password);
        console.log(email);
        const hashedPassword = await this.authService.generateHashedPassword(password);
        const user = await this.usersRepository.createUser(userDto, hashedPassword);

        const jwtTokenResponse = await this.authService.createJwtToken(email);
        return { jwtToken: jwtTokenResponse.jwtToken, userId :  user.id};
        /*if (user.email === email) {
            const userConfirmationEmail = await this.emailsService.sendEmailConfirmationEmail(user.email);
        }*/
        //return user;
    }

    async login(userDto : UserDto) : Promise<UserResponseDto> {
        const {email, password} = userDto;
        const user = await this.usersRepository.findOne({email});

        if (user && await this.authService.validatePasswordLogin(password, user.password)) {
            const jwtTokenResponse = await this.authService.createJwtToken(email);
            return { jwtToken: jwtTokenResponse.jwtToken, userId :  user.id};
        } else {
            throw new UnauthorizedException('No existing account found with these credentials');
        }
    }

    async findOne(jwtToken : string) : Promise<string> {
        const userInfo = await this.authService.decodeJwtToken(jwtToken);
        const user = await this.usersRepository.findOne({email: userInfo.email});
        if (user) {
            return user.id
        }
        else {
            throw new UnauthorizedException('No existing account found with these credentials');
        }
    }
}
