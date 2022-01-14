import { Body, Controller, Get, Post, Req, UseGuards, Param, ClassSerializerInterceptor, UseInterceptors, Patch, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PayloadValidationPipe } from 'src/common/pipes/payload-validation.pipe';
import { ConfirmUserDto } from './dto/confirm-user.dto';
import { UserDto } from './dto/user.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { IsActivatedGuard } from './guards/is-activated.guard';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {
    constructor(private readonly usersService : UsersService) {}
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('/')
    signUp(@Body(new PayloadValidationPipe()) userDto : UserDto): Promise<UserResponseDto> {
        return this.usersService.signUp(userDto)
    }

    @UseGuards(IsActivatedGuard)
    @Post('/login')
    login(@Body(new PayloadValidationPipe()) userDto : UserDto): Promise<UserResponseDto> {
        return this.usersService.login(userDto)
    }

    @Post('/confirm-email')
    confirmEmail(@Body() confirmUserDto: ConfirmUserDto): Promise<any> {
        return this.usersService.confirmUserEmail(confirmUserDto.token)
    }

    @UseGuards(IsActivatedGuard)
    @Patch('/:userId')
    updateUser(@Body(new PayloadValidationPipe()) userDto : UserDto, @Param('userId', new ParseUUIDPipe()) userId: string): Promise<UserResponseDto> {
        return this.usersService.updateUser(userDto, userId);
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

 