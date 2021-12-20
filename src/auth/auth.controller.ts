import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignupDto } from './dto/auth-signup-dto';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) {}
    @Post('signup')
    signUp(@Body() authSignupDto : AuthSignupDto): Promise<void> {
        return this.authService.signUp(authSignupDto)
    }
}
