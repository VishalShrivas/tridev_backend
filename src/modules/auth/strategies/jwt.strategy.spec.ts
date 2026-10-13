import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Role, type User } from '@prisma/client';
import { UsersService } from '../../users/services/users.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: jest.Mocked<UsersService>;

  const mockUser: User = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'jane.doe@example.com',
    passwordHash: 'hashed',
    firstName: 'Jane',
    lastName: 'Doe',
    role: Role.TEACHER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: { findByEmail: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-secret') },
        },
      ],
    }).compile();

    strategy = module.get(JwtStrategy);
    usersService = module.get(UsersService);
  });

  it('returns the authenticated user when the payload matches a known user', async () => {
    usersService.findByEmail.mockResolvedValue(mockUser);

    const result = await strategy.validate({
      sub: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
    });

    expect(result).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
    });
  });

  it('throws UnauthorizedException when no user matches the payload email', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      strategy.validate({
        sub: 'x',
        email: 'unknown@example.com',
        role: Role.TEACHER,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws UnauthorizedException when the token subject does not match the user id', async () => {
    usersService.findByEmail.mockResolvedValue(mockUser);

    await expect(
      strategy.validate({
        sub: 'mismatched-id',
        email: mockUser.email,
        role: mockUser.role,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
