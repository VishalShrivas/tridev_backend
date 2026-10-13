import { BadRequestException, Injectable } from '@nestjs/common';
import { EnrollmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import {
  BulkPromoteDto,
  PromotionEntryDto,
  PromotionOutcome,
} from '../dto/bulk-promote.dto';
import { PromotionResultDto } from '../dto/promotion-result.dto';

const OUTCOME_TO_ENROLLMENT_STATUS: Record<PromotionOutcome, EnrollmentStatus> =
  {
    [PromotionOutcome.PROMOTED]: EnrollmentStatus.PROMOTED,
    [PromotionOutcome.REPEATED]: EnrollmentStatus.REPEATED,
    [PromotionOutcome.LEFT]: EnrollmentStatus.LEFT,
  };

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Promotes each listed student from their current enrollment in
   * `fromAcademicYearId` into `toAcademicYearId`. Never mutates or deletes
   * the old Enrollment row (only its status) and never overwrites history —
   * a new Enrollment row is inserted for every non-LEFT outcome, preserving
   * a full year-by-year trail per student.
   *
   * Each student is promoted in its own transaction so one bad entry
   * (missing enrollment, missing newClassId, duplicate enrollment in the
   * target year) doesn't roll back the rest of the batch.
   */
  async bulkPromote(dto: BulkPromoteDto): Promise<PromotionResultDto[]> {
    const results: PromotionResultDto[] = [];

    for (const entry of dto.entries) {
      results.push(
        await this.promoteOne(
          dto.fromAcademicYearId,
          dto.toAcademicYearId,
          entry,
        ),
      );
    }

    return results;
  }

  private async promoteOne(
    fromAcademicYearId: string,
    toAcademicYearId: string,
    entry: PromotionEntryDto,
  ): Promise<PromotionResultDto> {
    try {
      if (entry.outcome !== PromotionOutcome.LEFT && !entry.newClassId) {
        throw new BadRequestException(
          'newClassId is required for PROMOTED and REPEATED outcomes',
        );
      }

      const currentEnrollment = await this.prisma.enrollment.findUnique({
        where: {
          studentId_academicYearId: {
            studentId: entry.studentId,
            academicYearId: fromAcademicYearId,
          },
        },
      });

      if (!currentEnrollment) {
        throw new BadRequestException(
          'Student has no enrollment in the source academic year',
        );
      }

      const newStatus = OUTCOME_TO_ENROLLMENT_STATUS[entry.outcome];

      const newEnrollment = await this.prisma.$transaction(async (tx) => {
        await tx.enrollment.update({
          where: { id: currentEnrollment.id },
          data: { status: newStatus },
        });

        if (entry.outcome === PromotionOutcome.LEFT) {
          return null;
        }

        return tx.enrollment.create({
          data: {
            studentId: entry.studentId,
            classId: entry.newClassId as string,
            academicYearId: toAcademicYearId,
            rollNumber: currentEnrollment.rollNumber,
          },
        });
      });

      return {
        studentId: entry.studentId,
        success: true,
        newEnrollmentId: newEnrollment?.id,
      };
    } catch (error) {
      return {
        studentId: entry.studentId,
        success: false,
        error: this.describeError(error),
      };
    }
  }

  private describeError(error: unknown): string {
    if (error instanceof BadRequestException) {
      const response = error.getResponse();
      return typeof response === 'string' ? response : error.message;
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return 'Student is already enrolled in the target academic year';
    }

    return 'Promotion failed';
  }
}
