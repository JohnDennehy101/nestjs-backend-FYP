import { Test } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from './constants';
import { LocalStrategy } from './local.strategy';

const mockUser = {
  email: 'test@gmail.com',
  password: 'somePassword123%',
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [AuthService, LocalStrategy],
    }).compile();

    authService = module.get(AuthService);
  });

  describe('Create JWT Token', () => {
    it('calls AuthService.createJwtToken and returns the created JWT', async () => {
      const result = await authService.createJwtToken(mockUser.email);
      expect(result).toBeDefined();
    });
  });

  describe('Decode JWT Token', () => {
    it('calls AuthService.decodeJwtToken and returns the decoded user email', async () => {
      const jwt = await authService.createJwtToken(mockUser.email);
      const result = await authService.decodeJwtToken(jwt);
      expect(result).toBeDefined();
      expect(result.email).toEqual(mockUser.email);
    });
  });

  describe('Create Hashed Password', () => {
    it('calls AuthService.generateHashedPassword and returns the hash', async () => {
      const hashedPassword = await authService.generateHashedPassword(
        mockUser.password,
      );
      expect(hashedPassword).toBeDefined();
    });
  });

  describe('Check if hashed password matches plain text value', () => {
    it('calls AuthService.validatePasswordLogin and returns true if a match', async () => {
      const hashedPassword = await authService.generateHashedPassword(
        mockUser.password,
      );
      const result = await authService.validatePasswordLogin(
        mockUser.password,
        hashedPassword,
      );
      expect(hashedPassword).toBeDefined();
      expect(result).toEqual(true);
    });
  });
});
