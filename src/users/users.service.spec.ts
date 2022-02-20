import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EmailsService } from '../emails/emails.service';
import { AuthService } from '../auth/auth.service';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { ImagesService } from '../images/images.service';

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
};
const mockUserTwo = {
  id: '102023920392039',
  email: 'test2@gmail.com',
  password: '01010101001',
  emailConfirmed: false,
  profileImageUrl: null,
};

const mockUserThree = {
  id: '505050505055050',
  email: 'test3@gmail.com',
  password: '90909090909',
  emailConfirmed: true,
  profileImageUrl: null,
};

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository;
  let authService: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
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

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    usersRepository = module.get(UsersRepository);
  });

  describe('Creating a User', () => {
    it('calls UsersRepository.createUser and returns the result', async () => {
      const mockCreatedUser = {
        id: '4040403f34u3f3j03',
        email: 'test@gmail.com',
        password: '5434fe34',
        emailConfirmed: false,
        profileImageUrl: null,
      };
      usersRepository.createUser.mockResolvedValue(mockCreatedUser);
      const result = await usersService.signUp(mockUser);
      expect(result.jwtToken).toEqual('token');
      expect(result.userEmail).toEqual(mockCreatedUser.email);
      expect(result.userId).toBeDefined();
    });
  });

  describe('Logging In a User', () => {
    it('calls UsersRepository.findOne and returns the result if correct details provided', async () => {
      const mockLoginData = {
        email: mockUserOne.email,
        password: mockUserOne.password,
      };
      usersRepository.findOne.mockResolvedValue(mockUserOne);
      const result = await usersService.login(mockLoginData);

      expect(result).toBeDefined();
      expect(result.jwtToken).toEqual('token');
      expect(result.userEmail).toEqual(mockUserOne.email);
      expect(result.userId).toEqual(mockUserOne.id);
    });
  });

  describe('Creating Accounts for Invited Users', () => {
    it('calls UsersRepository.createInvitedUser and returns the array of created users', async () => {
      const mockUserEmails = ['test@gmail.com', 'test2@gmail.com'];

      usersRepository.createInvitedUser.mockResolvedValue(
        mockUserOne,
        mockUserTwo,
      );
      const result = await usersService.createAccountsForInvitedUsers(
        mockUserEmails,
      );
      expect(result).toHaveLength(2);
      expect.arrayContaining([mockUserOne, mockUserTwo]);
    });
  });

  describe('Confirming user email', () => {
    it('calls UsersRepository.update and returns user info and emailConfirmed property (boolean)', async () => {
      usersRepository.findUserByEmail.mockResolvedValue(mockUserOne);
      const result = await usersService.confirmUserEmail(mockUserOne.email);
      expect(result).toBeDefined();
      expect(result.email).toEqual(mockUserOne.email);
    });
  });

  describe('Confirmed user email should return user', () => {
    it('calls UsersRepository.findOne and returns null if user has not confirmed email', async () => {
      usersRepository.findOne.mockResolvedValue(mockUserThree);
      const result = await usersService.checkConfirmedUser(mockUserThree.email);

      expect(result).toEqual(mockUserThree);
    });
  });

  describe('Updating user should return updated user', () => {
    it('calls UsersRepository.update and returns updated user', async () => {
      const userId = '1010';
      usersRepository.update.mockResolvedValue({
        email: 'newemail@gmail.com',
        password: mockUser.password,
      });
      const result = await usersService.updateUser(mockUser, userId);
      expect(result).toBeDefined();
      expect(result.userEmail).toEqual(mockUser.email);
      expect(result.userId).toEqual(userId);
    });
  });

  describe('Find One User based on JWT passed in request (which contains the user email)', () => {
    it('calls UsersRepository.findOne and returns user if found', async () => {
      usersRepository.findOne.mockResolvedValue(mockUserOne);
      const result = await usersService.findOne('token');
      expect(result).toBeDefined();
      expect(result).toEqual(mockUserOne.id);
    });
  });

  describe('Find One User based on userId passed in request', () => {
    it('calls UsersRepository.findOne and returns user if found', async () => {
      usersRepository.findOne.mockResolvedValue(mockUserOne);
      const result = await usersService.findOneUserById(mockUserOne.id);
      expect(result).toBeDefined();
      expect(result).toEqual(mockUserOne);
    });
  });

  describe('Find One User based on email passed in request', () => {
    it('calls UsersRepository.findOne and returns user if found', async () => {
      usersRepository.findOne.mockResolvedValue(mockUserOne);
      const result = await usersService.findOneUserByEmail(mockUserOne.email);
      expect(result).toBeDefined();
      expect(result).toEqual(mockUserOne);
    });
  });
});
