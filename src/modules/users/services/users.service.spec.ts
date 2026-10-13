import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role, type User } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

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
    prisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(UsersService);
  });

  describe('create', () => {
    it('persists the user with the given password hash, not the plaintext password', async () => {
      prisma.user.create.mockResolvedValue(mockUser);

      await service.create(
        {
          email: mockUser.email,
          password: 'plaintext-should-not-be-stored',
          firstName: 'Jane',
          lastName: 'Doe',
        },
        'hashed',
      );

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: mockUser.email,
          passwordHash: 'hashed',
          firstName: 'Jane',
          lastName: 'Doe',
        },
      });
    });
  });

  describe('findById', () => {
    it('returns the user when found', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id);

      expect(result).toEqual(mockUser);
    });

    it('throws NotFoundException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('throws NotFoundException when updating a non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update('missing-id', { firstName: 'New' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('updates and returns the user when it exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({ ...mockUser, firstName: 'New' });

      const result = await service.update(mockUser.id, { firstName: 'New' });

      expect(result.firstName).toBe('New');
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when deleting a non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('deletes the user when it exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await service.remove(mockUser.id);

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });
  });
});
