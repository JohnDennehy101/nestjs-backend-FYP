import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { EmailsService } from '../emails/emails.service';
import { ImagesService } from '../images/images.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

const mockUsersRepository = () => ({
  createUser: jest.fn(),
  createInvitedUser: jest.fn(),
  findUserByEmail: jest.fn(),
  update: jest.fn(),
  findOne: jest.fn(),
  setProfileImage: jest.fn(),
});

const mockUser = {
  email: 'test@gmail.com',
  password: 'somePassword123%',
};

const mockUserOne = {
  id: '4040403f34u3f3j03',
  email: 'test@gmail.com',
  password: '5434fe34',
  emailConfirmed: false,
  profileImageUrl: null,
  createdEvents: [],
  pollVotes: [],
  invitedEvents: [],
};

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;
  let usersRepository;
  let authService: AuthService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: UsersRepository, useFactory: mockUsersRepository },
        {
          provide: EmailsService,
          useValue: {
            sendEmailConfirmationEmail: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            createJwtToken: jest.fn().mockReturnValue('token'),
            generateHashedPassword: jest
              .fn()
              .mockResolvedValue('20103020329302'),
            decodeJwtToken: jest
              .fn()
              .mockResolvedValue({ email: mockUserOne.email }),
            validatePasswordLogin: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: ImagesService,
          useValue: {
            uploadImage: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = app.get<UsersController>(UsersController);
    usersService = app.get<UsersService>(UsersService);
    usersRepository = app.get(UsersRepository);
    authService = app.get(AuthService);
  });

  describe('signUp', () => {
    it('should sign up a user and return the response', async () => {
      const result = {
        jwtToken: 'token',
        userId: mockUserOne.id,
        userEmail: mockUserOne.email,
      };
      jest.spyOn(usersService, 'signUp').mockResolvedValue(result);

      expect(await usersController.signUp(mockUserOne)).toBe(result);
      expect(result).toBeDefined;
    });
  });

  describe('login', () => {
    it('should login a user and return the response', async () => {
      const result = {
        jwtToken: 'token',
        userId: mockUserOne.id,
        userEmail: mockUserOne.email,
      };
      jest.spyOn(usersService, 'login').mockResolvedValue(result);

      expect(await usersController.login(mockUserOne)).toBe(result);
      expect(result).toBeDefined;
    });
  });

  describe('confirmEmail', () => {
    it('should confirm a user email', async () => {
      const result = {
         emailConfirmed: true,
        passwordProvided: true,
        email: mockUserOne.email,
        id: mockUserOne.id,
      };
      jest.spyOn(usersService, 'confirmUserEmail').mockResolvedValue(result);

      expect(await usersController.confirmEmail({token: 'token'})).toBe(result);
      expect(result).toBeDefined;
    });
  });
});
