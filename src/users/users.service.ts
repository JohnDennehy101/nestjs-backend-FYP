import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from './dto/user.dto';
import { UsersRepository } from './users.repository';
import { AuthService } from 'src/auth/auth.service';
import { EmailsService } from 'src/emails/emails.service';
import { UserResponseDto } from './dto/user.response.dto';
import { User } from './user.entity';

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
       
        if (user.email === email) {
            const userConfirmationEmail = await this.emailsService.sendEmailConfirmationEmail(user.email);
        }

        return { jwtToken: jwtTokenResponse.jwtToken, userId :  user.id};
        //return user;
    }

    async createAccountsForInvitedUsers(userEmails : string[]) : Promise<User[]> {
        let invitedUsers = [];
        for (let email in userEmails) {
            let existingUserCheck = await this.usersRepository.findUserByEmail(userEmails[email])

            if (!existingUserCheck) {
                let newUser = await this.usersRepository.createInvitedUser(userEmails[email]);

                if (newUser) {
                    invitedUsers.push(newUser);

                    //User confirmation email is sent here, commenting out to save on email calls
                     //const userConfirmationEmail = await this.emailsService.sendEmailConfirmationEmail(newUser.email);
                }
            }
            else {
                invitedUsers.push(existingUserCheck);
            }
        }
        return invitedUsers;
    }

    async confirmUserEmail(token: string) {
        let tokenCheckUserInfo = await this.authService.decodeJwtToken(token);

        if (tokenCheckUserInfo) {
            let passwordProvided = true;
            await this.setConfirmedUser(tokenCheckUserInfo.email);
            let updatedUser = await this.usersRepository.findUserByEmail(tokenCheckUserInfo.email)
            if (updatedUser.password === null) {
                passwordProvided = false;
            }
            return {
                emailConfirmed: true,
                passwordProvided: passwordProvided,
                email: tokenCheckUserInfo.email,
                id: updatedUser.id
            };
        }
        else {
            return {
                emailConfirmed: false}
            };
        }
    


    async setConfirmedUser(email: string) {
    return this.usersRepository.update({ email }, {
      emailConfirmed: true
    });
}

    async checkConfirmedUser(email: string) {
        return this.usersRepository.findOne({email: email, emailConfirmed: true})
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

     async updateUser(userDto : UserDto, userId: string) : Promise<UserResponseDto> {
        const {email, password} = userDto;

        const hashedPassword = await this.authService.generateHashedPassword(password);
    

        await this.usersRepository.update(userId, {
            ...(email && {email: email}),
            ...(password && {password: hashedPassword})
        })
        
        const jwtTokenResponse = await this.authService.createJwtToken(email);
        return { jwtToken: jwtTokenResponse.jwtToken, userId :  userId};
        
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
