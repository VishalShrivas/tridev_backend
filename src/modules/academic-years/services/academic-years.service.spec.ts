import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { AcademicYear } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { AcademicYearsService } from './academic-years.service';

describe('AcademicYearsService', () => {
  let service: AcademicYearsService;
  let prisma: {
    academicYear: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const mockYear: AcademicYear = {
    id: '11111111-1111-1111-1111-111111111111',
    label: '2025-2026',
    startDate: new Date('2025-04-01'),
    endDate: new Date('2026-03-31'),
    isCurrent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      academicYear: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcademicYearsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AcademicYearsService);
  });

  describe('findCurrent', () => {
    it('throws NotFoundException when no year is marked current', async () => {
      prisma.academicYear.findFirst.mockResolvedValue(null);

      await expect(service.findCurrent()).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('returns the current year when one exists', async () => {
      prisma.academicYear.findFirst.mockResolvedValue({
        ...mockYear,
        isCurrent: true,
      });

      const result = await service.findCurrent();

      expect(result.isCurrent).toBe(true);
    });
  });

  describe('setCurrent', () => {
    it('throws NotFoundException when the target year does not exist', async () => {
      prisma.academicYear.findUnique.mockResolvedValue(null);

      await expect(service.setCurrent('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('unsets every other year and sets the target year as current in one transaction', async () => {
      prisma.academicYear.findUnique.mockResolvedValue(mockYear);
      prisma.$transaction.mockResolvedValue([
        { count: 1 },
        { ...mockYear, isCurrent: true },
      ]);

      const result = await service.setCurrent(mockYear.id);

      expect(result.isCurrent).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
