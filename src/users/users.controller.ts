import { Body, Controller, Get, Post, UseGuards, Param, ClassSerializerInterceptor, UseInterceptors, Patch, ParseUUIDPipe, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

    @UseGuards(AuthGuard())
    @Post('/confirm-email')
    confirmEmail(@Body() confirmUserDto: ConfirmUserDto): Promise<any> {
        return this.usersService.confirmUserEmail(confirmUserDto.token)
    }

    @UseGuards(AuthGuard())
    @UseGuards(IsActivatedGuard)
    @Patch('/:userId')
    updateUser(@Body(new PayloadValidationPipe()) userDto : UserDto, @Param('userId', new ParseUUIDPipe()) userId: string): Promise<UserResponseDto> {
        return this.usersService.updateUser(userDto, userId);
    }

    @Get('/findOne/:jwt')
    findOne(@Param('jwt') jwt) : Promise<string> {
        return this.usersService.findOne(jwt);
    }

    @Post('/:userId/image')
    @UseInterceptors(FileInterceptor('file'))
    uploadProfileImage(@UploadedFile() file: Express.Multer.File) {
    return this.usersService.uploadImageToCloudinary(file);
  }
}

 