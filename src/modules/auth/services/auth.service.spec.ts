import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { Role, type User } from '@prisma/client';
import { UsersService } from '../../users/services/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'jane.doe@example.com',
    passwordHash: '',
    firstName: 'Jane',
    lastName: 'Doe',
    role: Role.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockUser.passwordHash = await argon2.hash('StrongP@ssw0rd');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('signed.jwt.token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'jwt.secret') return 'test-secret';
              if (key === 'jwt.expiresIn') return '15m';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('login', () => {
    it('returns an access token when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.login({
        email: mockUser.email,
        password: 'StrongP@ssw0rd',
      });

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user.id).toBe(mockUser.id);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: mockUser.id, email: mockUser.email, role: mockUser.role },
        expect.objectContaining({ secret: 'test-secret', expiresIn: '15m' }),
      );
    });

    it('throws UnauthorizedException when the user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'whatever' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when the password is incorrect', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.login({ email: mockUser.email, password: 'WrongPassword' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
