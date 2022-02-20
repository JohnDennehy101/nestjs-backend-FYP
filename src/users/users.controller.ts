import { Body, Controller, Get, Post, UseGuards, Param, ClassSerializerInterceptor, UseInterceptors, Patch, ParseUUIDPipe, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { PayloadValidationPipe } from '../common/pipes/payload-validation.pipe';
import { ConfirmUserDto } from './dto/confirm-user.dto';
import { UserDto } from './dto/user.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { IsActivatedGuard } from './guards/is-activated.guard';
import { UsersService } from './users.service';
import { User } from './user.entity';


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

    @UseGuards(AuthGuard())
    @Post('/confirm-email')
    confirmEmail(@Body() confirmUserDto: ConfirmUserDto): Promise<any> {
        return this.usersService.confirmUserEmail(confirmUserDto.token)
    }

    @UseGuards(AuthGuard())
    @Patch('/:userId')
    updateUser(@Body(new PayloadValidationPipe()) userDto : UserDto, @Param('userId', new ParseUUIDPipe()) userId: string): Promise<UserResponseDto> {
        return this.usersService.updateUser(userDto, userId);
    }

    @UseGuards(AuthGuard())
    @Get('/:userId')
    findOneUserById(@Param('userId', new ParseUUIDPipe()) userId: string): Promise<User> {
        return this.usersService.findOneUserById(userId);
    }

    @Get('/findOne/:jwt')
    findOneUserByJwt(@Param('jwt') jwt) : Promise<string> {
        return this.usersService.findOne(jwt);
    }

    @UseGuards(AuthGuard())
    @Post('/:userId/image')
    @UseInterceptors(FileInterceptor('file'))
    uploadProfileImage(@UploadedFile() file: Express.Multer.File, @Param('userId') userId) {
    return this.usersService.uploadImageToCloudinary(file, userId);
  }
}

 