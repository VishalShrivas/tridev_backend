import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentStatus, Prisma, type Enrollment } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { PromotionOutcome } from '../dto/bulk-promote.dto';
import { PromotionsService } from './promotions.service';

describe('PromotionsService', () => {
  let service: PromotionsService;
  let tx: {
    enrollment: { update: jest.Mock; create: jest.Mock };
  };
  let prisma: {
    enrollment: { findUnique: jest.Mock };
    $transaction: jest.Mock;
  };

  const currentEnrollment: Enrollment = {
    id: 'enrollment-1',
    studentId: 'student-1',
    classId: 'class-old',
    academicYearId: 'year-1',
    rollNumber: '5',
    enrollmentDate: new Date(),
    status: EnrollmentStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    tx = {
      enrollment: {
        update: jest.fn().mockResolvedValue(undefined),
        create: jest.fn().mockResolvedValue({ id: 'enrollment-2' }),
      },
    };

    prisma = {
      enrollment: { findUnique: jest.fn() },
      $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
        callback(tx),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(PromotionsService);
  });

  it('marks the old enrollment PROMOTED and creates a new ACTIVE enrollment in the target class/year', async () => {
    prisma.enrollment.findUnique.mockResolvedValue(currentEnrollment);

    const results = await service.bulkPromote({
      fromAcademicYearId: 'year-1',
      toAcademicYearId: 'year-2',
      entries: [
        {
          studentId: 'student-1',
          outcome: PromotionOutcome.PROMOTED,
          newClassId: 'class-new',
        },
      ],
    });

    expect(results).toEqual([
      {
        studentId: 'student-1',
        success: true,
        newEnrollmentId: 'enrollment-2',
      },
    ]);
    expect(tx.enrollment.update).toHaveBeenCalledWith({
      where: { id: 'enrollment-1' },
      data: { status: EnrollmentStatus.PROMOTED },
    });
    expect(tx.enrollment.create).toHaveBeenCalledWith({
      data: {
        studentId: 'student-1',
        classId: 'class-new',
        academicYearId: 'year-2',
        rollNumber: '5',
      },
    });
  });

  it('never mutates the old enrollment beyond its status (history preserved)', async () => {
    prisma.enrollment.findUnique.mockResolvedValue(currentEnrollment);

    await service.bulkPromote({
      fromAcademicYearId: 'year-1',
      toAcademicYearId: 'year-2',
      entries: [
        {
          studentId: 'student-1',
          outcome: PromotionOutcome.REPEATED,
          newClassId: 'class-old',
        },
      ],
    });

    const updateCall = tx.enrollment.update.mock.calls[0][0] as {
      data: Record<string, unknown>;
    };
    expect(Object.keys(updateCall.data)).toEqual(['status']);
  });

  it('does not create a new enrollment for a LEFT outcome', async () => {
    prisma.enrollment.findUnique.mockResolvedValue(currentEnrollment);

    const results = await service.bulkPromote({
      fromAcademicYearId: 'year-1',
      toAcademicYearId: 'year-2',
      entries: [{ studentId: 'student-1', outcome: PromotionOutcome.LEFT }],
    });

    expect(results).toEqual([
      { studentId: 'student-1', success: true, newEnrollmentId: undefined },
    ]);
    expect(tx.enrollment.create).not.toHaveBeenCalled();
    expect(tx.enrollment.update).toHaveBeenCalledWith({
      where: { id: 'enrollment-1' },
      data: { status: EnrollmentStatus.LEFT },
    });
  });

  it('fails that entry without touching the transaction when newClassId is missing for PROMOTED', async () => {
    const results = await service.bulkPromote({
      fromAcademicYearId: 'year-1',
      toAcademicYearId: 'year-2',
      entries: [{ studentId: 'student-1', outcome: PromotionOutcome.PROMOTED }],
    });

    expect(results[0]).toMatchObject({
      studentId: 'student-1',
      success: false,
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('fails that entry when the student has no enrollment in the source year', async () => {
    prisma.enrollment.findUnique.mockResolvedValue(null);

    const results = await service.bulkPromote({
      fromAcademicYearId: 'year-1',
      toAcademicYearId: 'year-2',
      entries: [
        {
          studentId: 'student-1',
          outcome: PromotionOutcome.PROMOTED,
          newClassId: 'class-new',
        },
      ],
    });

    expect(results[0]).toMatchObject({
      studentId: 'student-1',
      success: false,
    });
  });

  it('continues processing remaining entries after one entry fails', async () => {
    prisma.enrollment.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(currentEnrollment);

    const results = await service.bulkPromote({
      fromAcademicYearId: 'year-1',
      toAcademicYearId: 'year-2',
      entries: [
        {
          studentId: 'bad-student',
          outcome: PromotionOutcome.PROMOTED,
          newClassId: 'class-new',
        },
        {
          studentId: 'student-1',
          outcome: PromotionOutcome.PROMOTED,
          newClassId: 'class-new',
        },
      ],
    });

    expect(results[0].success).toBe(false);
    expect(results[1].success).toBe(true);
  });

  it('reports a duplicate-enrollment conflict with a clear message', async () => {
    prisma.enrollment.findUnique.mockResolvedValue(currentEnrollment);
    tx.enrollment.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '6.0.0',
      }),
    );

    const results = await service.bulkPromote({
      fromAcademicYearId: 'year-1',
      toAcademicYearId: 'year-2',
      entries: [
        {
          studentId: 'student-1',
          outcome: PromotionOutcome.PROMOTED,
          newClassId: 'class-new',
        },
      ],
    });

    expect(results[0]).toMatchObject({
      success: false,
      error: 'Student is already enrolled in the target academic year',
    });
  });
});
