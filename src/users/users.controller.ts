import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  ClassSerializerInterceptor,
  UseInterceptors,
  Patch,
  ParseUUIDPipe,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { PayloadValidationPipe } from '../common/pipes/payload-validation.pipe';
import { ConfirmUserDto } from './dto/confirm-user.dto';
import { UserDto } from './dto/user.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { IsActivatedGuard } from './guards/is-activated.guard';
import { UsersService } from './users.service';
import { User } from './user.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Signs up a user',
    description:
      'If valid payload provided (and no existing account with provided email), user account is successfully created',
  })
  @ApiBody({
    type: UserDto,
    description: 'New user structure',
  })
  @ApiResponse({
    type: UserResponseDto,
    status: 201,
    description: 'New user created',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Account already exists with provided email.',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/')
  signUp(
    @Body(new PayloadValidationPipe()) userDto: UserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.signUp(userDto);
  }

  @ApiOperation({
    summary: 'Login a user',
    description:
      'If valid payload provided (and user has confirmed email), user gets successful JWT response',
  })
  @ApiBody({
    type: UserDto,
    description: 'User structure',
  })
  @ApiResponse({
    type: UserResponseDto,
    status: 200,
    description: 'User logged in',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Unauthorized request. User must confirm email before access is provided to events API routes.',
  })
  @UseGuards(IsActivatedGuard)
  @Post('/login')
  login(
    @Body(new PayloadValidationPipe()) userDto: UserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.login(userDto);
  }

  @ApiOperation({
    summary: 'Confirm user email',
    description:
      'If valid jwt provided, user account emailConfirmed status associated with email in jwt is set to true',
  })
  @ApiBody({
    type: ConfirmUserDto,
    description: 'JWT sent in body of request',
  })
  @ApiResponse({
    type: UserResponseDto,
    status: 200,
    description: 'User Record returned',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('/confirm-email')
  confirmEmail(@Body() confirmUserDto: ConfirmUserDto): Promise<any> {
    return this.usersService.confirmUserEmail(confirmUserDto.token);
  }

  @ApiOperation({
    summary: 'Updates a user',
    description: 'If valid payload provided, user account is updated',
  })
  @ApiBody({
    type: UserDto,
    description: 'Updated properties for user account',
  })
  @ApiResponse({
    type: UserResponseDto,
    status: 200,
    description: 'User updated',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Account already exists with provided email.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Patch('/:userId')
  updateUser(
    @Body(new PayloadValidationPipe()) userDto: UserDto,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUser(userDto, userId);
  }

  @ApiOperation({
    summary: 'Gets a user by userId',
    description: 'If valid userid provided, user account is returned',
  })
  @ApiResponse({
    type: User,
    status: 200,
    description: 'User returned',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Get('/:userId')
  findOneUserById(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<User> {
    return this.usersService.findOneUserById(userId);
  }

  @ApiOperation({
    summary: 'Gets a user by JWT',
    description:
      'If valid user email contained within jwt, account associated with email is returned',
  })
  @ApiParam({
    name: 'jwt',
    required: true,
    description: 'string representation of jwt',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiResponse({
    type: UserResponseDto,
    status: 200,
    description: 'User id returned',
  })
  @Get('/findOne/:jwt')
  findOneUserByJwt(@Param('jwt') jwt): Promise<string> {
    return this.usersService.findOne(jwt);
  }

  @ApiOperation({
    summary: 'Update user image',
    description: 'If valid payload provided, user image is updated',
  })
  @ApiParam({
    name: 'userid',
    required: true,
    description: 'string representation of the user id in the database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiResponse({
    type: Object,
    status: 200,
    description: 'User image updated',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @Post('/:userId/image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('userId') userId,
  ) {
    return this.usersService.uploadImageToCloudinary(file, userId);
  }
}
