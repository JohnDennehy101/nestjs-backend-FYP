import { Body, Controller, Get, Post, Req, UseGuards, Param, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PayloadValidationPipe } from 'src/common/pipes/payload-validation.pipe';
import { UserDto } from './dto/user.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {
    constructor(private readonly usersService : UsersService) {}
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('/')
    signUp(@Body(new PayloadValidationPipe()) userDto : UserDto): Promise<{jwtToken: string}> {
        return this.usersService.signUp(userDto)
    }

    @Post('/login')
    login(@Body(new PayloadValidationPipe()) userDto : UserDto): Promise<{jwtToken: string}> {
        return this.usersService.login(userDto)
    }

    @Post('/test')
     @UseGuards(AuthGuard())
     test(@Req() req) {
         console.log(req)
     }
}

 