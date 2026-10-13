import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { Role, type Teacher, type User } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { TeachersService } from './teachers.service';

describe('TeachersService', () => {
  let service: TeachersService;
  let prisma: {
    user: { findUnique: jest.Mock; create: jest.Mock; delete: jest.Mock };
    teacher: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  const mockUser: User = {
    id: 'user-1',
    email: 'teacher@example.com',
    passwordHash: 'hashed',
    firstName: 'Meera',
    lastName: 'Patel',
    role: Role.TEACHER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTeacher: Teacher = {
    id: 'teacher-1',
    userId: 'user-1',
    employeeCode: 'EMP-001',
    phone: null,
    address: null,
    qualification: null,
    joiningDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      teacher: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(TeachersService);
  });

  describe('create', () => {
    it('throws ConflictException when the email is already registered', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.create({
          email: mockUser.email,
          password: 'StrongP@ssw0rd',
          firstName: 'Meera',
          lastName: 'Patel',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('creates the User and Teacher together with role TEACHER and a hashed password', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        ...mockUser,
        teacher: mockTeacher,
      });
      prisma.teacher.findUnique.mockResolvedValue({
        ...mockTeacher,
        user: mockUser,
      });

      const result = await service.create({
        email: mockUser.email,
        password: 'StrongP@ssw0rd',
        firstName: 'Meera',
        lastName: 'Patel',
        employeeCode: 'EMP-001',
      });

      expect(result.user.email).toBe(mockUser.email);
      const createArgs = prisma.user.create.mock.calls[0][0] as {
        data: { role: Role; passwordHash: string };
      };
      expect(createArgs.data.role).toBe(Role.TEACHER);
      expect(createArgs.data.passwordHash).not.toBe('StrongP@ssw0rd');
      expect(
        await argon2.verify(createArgs.data.passwordHash, 'StrongP@ssw0rd'),
      ).toBe(true);
    });
  });

  describe('findById', () => {
    it('throws NotFoundException when the teacher does not exist', async () => {
      prisma.teacher.findUnique.mockResolvedValue(null);

      await expect(service.findById('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deletes the underlying User (cascades to the Teacher row)', async () => {
      prisma.teacher.findUnique.mockResolvedValue({
        ...mockTeacher,
        user: mockUser,
      });

      await service.remove(mockTeacher.id);

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: mockTeacher.userId },
      });
    });
  });
});
