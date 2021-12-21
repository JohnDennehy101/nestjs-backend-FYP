import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials-dto';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) {}
    @Post('/signup')
    signUp(@Body() authCredentialsDto : AuthCredentialsDto): Promise<void> {
        return this.authService.signUp(authCredentialsDto)
    }

    @Post('/login')
    login(@Body() authCredentialsDto : AuthCredentialsDto): Promise<{jwtToken: string}> {
        return this.authService.login(authCredentialsDto)
    }
/*
    @Post('/test')
    @UseGuards(AuthGuard())
    test(@Req() req) {
        console.log(req)
    } */
}
