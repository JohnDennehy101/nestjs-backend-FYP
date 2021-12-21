import { Body, Controller, Get, Post, Req, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {
    constructor(private readonly usersService : UsersService) {}
     @Post('/signup')
    signUp(@Body() userDto : UserDto): Promise<void> {
        return this.usersService.signUp(userDto)
    }

    @Post('/login')
    login(@Body() userDto : UserDto): Promise<{jwtToken: string}> {
        return this.usersService.login(userDto)
    }

    @Post('/test')
     @UseGuards(AuthGuard())
     test(@Req() req) {
         console.log(req)
     }
}

 