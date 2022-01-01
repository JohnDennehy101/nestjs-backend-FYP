import { Body, Controller, Get, Post, Req, UseGuards, Param, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PayloadValidationPipe } from 'src/common/pipes/payload-validation.pipe';
import { UserDto } from './dto/user.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {
    constructor(private readonly usersService : UsersService) {}
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('/')
    signUp(@Body(new PayloadValidationPipe()) userDto : UserDto): Promise<UserResponseDto> {
        return this.usersService.signUp(userDto)
    }

    @Post('/login')
    login(@Body(new PayloadValidationPipe()) userDto : UserDto): Promise<UserResponseDto> {
        return this.usersService.login(userDto)
    }

    @Get('/findOne/:jwt')
    findOne(@Param('jwt') jwt) : Promise<string> {
        return this.usersService.findOne(jwt);
    }

    @Post('/test')
     @UseGuards(AuthGuard())
     test(@Req() req) {
         console.log(req)
     }
}

 