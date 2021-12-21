import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JWTTokenPayload } from './jwt-interface';

@Injectable()
export class AuthService {
    constructor (
        private readonly jwtTokenService: JwtService
    ) {}


    async createJwtToken(email: string) : Promise<{jwtToken: string}> {
        const jwtPayload : JWTTokenPayload = {email};
        const jwtToken : string  = await this.jwtTokenService.sign(jwtPayload)
        return {jwtToken}
    }

    async validatePasswordLogin(enteredPassword: string, storedPassword: string) : Promise<Boolean> {

        return bcrypt.compare(enteredPassword, storedPassword)
    }
}
