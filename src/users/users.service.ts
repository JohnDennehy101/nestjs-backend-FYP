import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from './dto/user.dto';
import { UsersRepository } from './users.repository';
import { AuthService } from '../auth/auth.service';
import { EmailsService } from '../emails/emails.service';
import { UserResponseDto } from './dto/user.response.dto';
import { User } from './user.entity';
import { ImagesService } from '../images/images.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private authService: AuthService,
    private emailsService: EmailsService,
    private imagesService: ImagesService,
  ) {}

  private logger: Logger = new Logger('UsersService');

  async signUp(userDto: UserDto): Promise<UserResponseDto> {
    const { password, email } = userDto;
    const hashedPassword = await this.authService.generateHashedPassword(
      password,
    );
    const user = await this.usersRepository.createUser(userDto, hashedPassword);

    this.logger.log(`Creating new user - id: ${user.id}`);

    const jwtTokenResponse = await this.authService.createJwtToken(email);

    if (user.email === email) {
      const userConfirmationEmail =
        await this.emailsService.sendEmailConfirmationEmail(user.email);
    }

    return { jwtToken: jwtTokenResponse, userId: user.id, userEmail: email };
  }

  async createAccountsForInvitedUsers(userEmails: string[]): Promise<User[]> {
    let invitedUsers = [];
    for (let email in userEmails) {
      let existingUserCheck = await this.usersRepository.findUserByEmail(
        userEmails[email],
      );

      if (!existingUserCheck) {
        let newUser = await this.usersRepository.createInvitedUser(
          userEmails[email],
        );

        this.logger.log(
          `Creating account for event invited user - id: ${newUser.id}`,
        );

        if (newUser) {
          invitedUsers.push(newUser);

          await this.emailsService.sendEmailConfirmationEmail(newUser.email);
        }
      } else {
        invitedUsers.push(existingUserCheck);
      }
    }
    return invitedUsers;
  }

  async confirmUserEmail(token: string) {
    let tokenCheckUserInfo = await this.authService.decodeJwtToken(token);

    if (tokenCheckUserInfo) {
      let passwordProvided = true;
      await this.setConfirmedUser(tokenCheckUserInfo.email);
      this.logger.log(`User has confirmed email`);
      let updatedUser = await this.usersRepository.findUserByEmail(
        tokenCheckUserInfo.email,
      );
      if (!updatedUser.passwordProvided) {
        this.logger.log(`User has not yet provided password`);
        passwordProvided = false;
      }
      return {
        emailConfirmed: true,
        passwordProvided: passwordProvided,
        email: tokenCheckUserInfo.email,
        id: updatedUser.id,
      };
    } else {
      this.logger.log(`User has not yet confirmed their email`);
      return {
        emailConfirmed: false,
      };
    }
  }

  async setConfirmedUser(email: string) {
    return this.usersRepository.update(
      { email },
      {
        emailConfirmed: true,
      },
    );
  }

  async checkConfirmedUser(email: string) {
    return this.usersRepository.findOne({ email: email, emailConfirmed: true });
  }

  async login(userDto: UserDto): Promise<UserResponseDto> {
    const { email, password } = userDto;
    const user = await this.usersRepository.findOne(
      { email },
      { select: ['id', 'password', 'email'] },
    );

    if (
      user &&
      (await this.authService.validatePasswordLogin(password, user.password))
    ) {
      const jwtTokenResponse = await this.authService.createJwtToken(email);
      this.logger.log(`Successful login for user - id: ${user.id}`);
      return {
        jwtToken: jwtTokenResponse,
        userId: user.id,
        userEmail: user.email,
      };
    } else {
      throw new UnauthorizedException(
        'No existing account found with these credentials',
      );
    }
  }

  async updateUser(userDto: UserDto, userId: string): Promise<UserResponseDto> {
    const { email, password } = userDto;

    const hashedPassword = await this.authService.generateHashedPassword(
      password,
    );

    await this.usersRepository.update(userId, {
      ...(email && { email: email }),
      ...(password && { password: hashedPassword }),
      passwordProvided: true,
    });

    this.logger.log(`Updated user - id: ${userId}`);

    const jwtTokenResponse = await this.authService.createJwtToken(email);
    return { jwtToken: jwtTokenResponse, userId: userId, userEmail: email };
  }

  async findOne(jwtToken: string): Promise<string> {
    const userInfo = await this.authService.decodeJwtToken(jwtToken);
    const user = await this.usersRepository.findOne({ email: userInfo.email });
    if (user) {
      this.logger.log(`Individual user found - ${user.id}`);
      return user.id;
    } else {
      throw new UnauthorizedException(
        'No existing account found with these credentials',
      );
    }
  }

  async findOneUserById(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ id: userId });
    if (user) {
      this.logger.log(`Individual user found by id, userId : ${user.id}`);
      return user;
    } else {
      throw new UnauthorizedException(
        'No existing account found for that userId',
      );
    }
  }

  async findOneUserByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ email: email });
    if (user) {
      this.logger.log(`Individual user found by email, id: ${user.id}`);
      return user;
    } else {
      throw new UnauthorizedException(
        'No existing account found for that email',
      );
    }
  }
  async uploadImageToCloudinary(file: Express.Multer.File, userId: string) {
    let response = await this.imagesService.uploadImage(file).catch(() => {
      throw new BadRequestException('Invalid file type.');
    });

    if (response) {
      await this.usersRepository.setProfileImage(response.secure_url, userId);
      this.logger.log(`Setting profile image for user - id: ${userId}`);
    }

    return response;
  }
}
