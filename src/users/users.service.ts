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
        //private jwtTokenService: JwtService
    ) {}

    async signUp(userDto : UserDto) : Promise<void> {
        return this.usersRepository.createUser(userDto)
    }

    async login(userDto : UserDto) : Promise<{jwtToken: string}> {
        const {email, password} = userDto;
        const user = await this.usersRepository.findOne({email});

        //if (user && await bcrypt.compare(password, user.password)) {
        if (user && await this.authService.validatePasswordLogin(password, user.password)) {
            //const jwtPayload : JWTTokenPayload = {email};
            const jwtToken = await this.authService.createJwtToken(email);

            return jwtToken;
            //const jwtPayload : JWTTokenPayload = {email};
            //const jwtToken : string = await this.jwtTokenService.sign(jwtPayload)
            //return { jwtToken };
        } else {
            throw new UnauthorizedException('No existing account found with these credentials')
        }
    }
}
