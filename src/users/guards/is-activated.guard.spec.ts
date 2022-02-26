import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth/auth.service';
import { UsersRepository } from '../users.repository';
import { UsersService } from '../users.service';
import { IsActivatedEventRequestsGuard } from './is-activated-event-requests.guard';
import { IsActivatedGuard } from './is-activated.guard';

describe('IsActivatedGuard - success', () => {
  let guard: IsActivatedGuard;
  let config: ConfigService;
  let usersService: UsersService;

  const mockUsersRepository = () => ({
    findOne: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IsActivatedGuard,
        {
          provide: AuthService,
          useValue: {
            decodeJwtToken: jest
              .fn()
              .mockResolvedValue({ email: 'test@gmail.com' }),
            validatePasswordLogin: jest.fn().mockResolvedValue(true),
          },
        },
        { provide: UsersRepository, useFactory: mockUsersRepository },
        {
          provide: UsersService,
          useValue: {
            checkConfirmedUser: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'internalToken') {
                return 123;
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    config = module.get<ConfigService>(ConfigService);
    guard = module.get<IsActivatedGuard>(IsActivatedGuard);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should return true for valid user check', async () => {
    const context = {
      getClass: jest.fn(),
      getHandler: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: 'providedToken',
          },
          body: {
            email: 'test@gmail.com',
          },
        }),
      })),
    } as any;

    const result = await guard.canActivate(context);
    expect(context.switchToHttp).toHaveBeenCalled();
    expect(result).toEqual(true);
  });
});

describe('IsActivatedGuard - failure', () => {
  let guard: IsActivatedGuard;
  let config: ConfigService;
  let usersService: UsersService;

  const mockUsersRepository = () => ({
    findOne: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IsActivatedGuard,
        {
          provide: AuthService,
          useValue: {
            decodeJwtToken: jest
              .fn()
              .mockResolvedValue({ email: 'test@gmail.com' }),
            validatePasswordLogin: jest.fn().mockResolvedValue(true),
          },
        },
        { provide: UsersRepository, useFactory: mockUsersRepository },
        {
          provide: UsersService,
          useValue: {
            checkConfirmedUser: jest.fn().mockResolvedValue(false),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'internalToken') {
                return 123;
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    config = module.get<ConfigService>(ConfigService);
    guard = module.get<IsActivatedGuard>(IsActivatedGuard);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should return false for invalid user check', async () => {
    const context = {
      getClass: jest.fn(),
      getHandler: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: 'providedToken',
          },
          body: {
            email: 'test@gmail.com',
          },
        }),
      })),
    } as any;

    const result = await guard.canActivate(context);
    expect(context.switchToHttp).toHaveBeenCalled();
    expect(result).toEqual(false);
  });
});
