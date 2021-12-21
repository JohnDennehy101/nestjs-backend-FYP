import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials-dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JWTTokenPayload } from './jwt-interface';

@Injectable()
export class AuthService {
    constructor (
        @InjectRepository(UsersRepository)
        private usersRepository: UsersRepository,
        private jwtTokenService: JwtService
    ) {}

    async signUp(authCredentialsDto : AuthCredentialsDto) : Promise<void> {
        return this.usersRepository.createUser(authCredentialsDto)
    }

    async login(authCredentialsDto : AuthCredentialsDto) : Promise<{jwtToken: string}> {
        const {email, password} = authCredentialsDto;
        const user = await this.usersRepository.findOne({email});

        if (user && await bcrypt.compare(password, user.password)) {
            const jwtPayload : JWTTokenPayload = {email};
            const jwtToken : string = await this.jwtTokenService.sign(jwtPayload)
            return { jwtToken };
        } else {
            throw new UnauthorizedException('No existing account found with these credentials')
        }
    }
}
