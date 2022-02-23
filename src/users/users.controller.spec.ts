import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'stream';
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

      expect(await usersController.confirmEmail({ token: 'token' })).toBe(
        result,
      );
      expect(result).toBeDefined;
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const result = {
        jwtToken: 'token',
        userId: mockUserOne.id,
        userEmail: mockUserOne.email,
      };

      jest.spyOn(usersService, 'updateUser').mockResolvedValue(result);

      expect(
        await usersController.updateUser(mockUserOne, mockUserOne.id),
      ).toBe(result);
      expect(result).toBeDefined;
    });
  });

  describe('findOneUserById', () => {
    it('should find a user by provided id', async () => {
      jest
        .spyOn(usersService, 'findOneUserById')
        .mockResolvedValue(mockUserOne);

      expect(await usersController.findOneUserById(mockUserOne.id)).toBe(
        mockUserOne,
      );
    });
  });

  describe('findOneUserByJwt', () => {
    it('should find a user by provided JWT', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUserOne.id);

      expect(await usersController.findOneUserByJwt('token')).toBe(
        mockUserOne.id,
      );
    });
  });

  describe('uploadProfileImage', () => {
    it('should upload profile image provided by user', async () => {
      let file: Express.Multer.File = {
        filename: '',
        fieldname: '',
        originalname: '',
        encoding: '',
        mimetype: '',
        size: 1,
        stream: new Readable(),
        destination: '',
        path: '',
        buffer: new Buffer(''),
      };

      let sampleResponse = {
        asset_id: 'b5e6d2b39ba3e0869d67141ba7dba6cf',
        public_id: 'sample',
        version: 1473599877,
        version_id: '98f52566f43d8e516a486958a45c1eb9',
        signature: 'abcdefghijklmnopqrstuvwxyz12345',
        width: 864,
        height: 576,
        format: 'jpg',
        resource_type: 'image',
        created_at: '2017-08-11T13:17:57Z',
        bytes: 109669,
        type: 'upload',
        message: 'ok',
        name: 'allok',
        http_code: 201,
        placeholder: 'false',
        url: 'http://res.cloudinary.com/demo/image/upload/v1473599877/sample.jpg',
        secure_url:
          'https://res.cloudinary.com/demo/image/upload/v1473599877/sample.jpg',
        access_mode: 'public',
        eager: [
          {
            transformation: 'c_crop,g_face,h_400,w_400',
            width: 400,
            height: 400,
            url: 'http://res.cloudinary.com/demo/image/upload/c_crop,g_face,h_400,w_400/v1473599877/sample.jpg',
            secure_url:
              'https://res.cloudinary.com/demo/image/upload/c_crop,g_face,h_400,w_400/v1473599877/sample.jpg',
          },
          {
            transformation: 'b_blue,c_pad,h_400,w_660',
            width: 660,
            height: 400,
            url: 'http://res.cloudinary.com/demo/image/upload/b_blue,c_pad,h_400,w_660/v1473599877/sample.jpg',
            secure_url:
              'https://res.cloudinary.com/demo/image/upload/b_blue,c_pad,h_400,w_660/v1473599877/sample.jpg',
          },
        ],
      };

      jest
        .spyOn(usersService, 'uploadImageToCloudinary')
        .mockResolvedValue(sampleResponse);

      expect(
        await usersController.uploadProfileImage(file, mockUserOne.id),
      ).toBe(sampleResponse);
    });
  });
});
