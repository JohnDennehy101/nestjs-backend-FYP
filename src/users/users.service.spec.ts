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
  setProfileImage: jest.fn()
});

const mockUser = {
  email: 'test@gmail.com',
  password: 'somePassword123%',
};

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({

  providers: 
    [
      UsersService, 
      { provide: UsersRepository, useFactory: mockUsersRepository }, 
      { provide: EmailsService, useValue: {
          sendEmailConfirmationEmail: jest.fn()
      }},
      {provide: AuthService, useValue: {
          createJwtToken: jest.fn().mockReturnValue('token'),
          generateHashedPassword: jest.fn().mockResolvedValue("20103020329302")
      }},
      {provide: ImagesService, useValue: {
          uploadImage: jest.fn()
      }}
    ],
  
    }).compile();

    usersService = module.get(UsersService);
    usersRepository = module.get(UsersRepository);
  });

  describe('createUser', () => {
    it('calls UsersRepository.createUser and returns the result', async () => {
      const mockCreatedUser = {
          id: '4040403f34u3f3j03',
          email: 'test@gmail.com',
          password: '5434fe34',
          emailConfirmed: false,
          profileImageUrl: null,

      }
      usersRepository.createUser.mockResolvedValue(mockCreatedUser);
      const result = await usersService.signUp(mockUser);
      expect(result.jwtToken).toEqual("token");
      expect(result.userEmail).toEqual(mockCreatedUser.email);
      expect(result.userId).toBeDefined();
    });
  });

});