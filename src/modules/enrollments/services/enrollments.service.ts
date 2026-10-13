import { Injectable, NotFoundException } from '@nestjs/common';
import type { Enrollment } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import { QueryEnrollmentsDto } from '../dto/query-enrollments.dto';
import { UpdateEnrollmentDto } from '../dto/update-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEnrollmentDto): Promise<Enrollment> {
    return this.prisma.enrollment.create({
      data: {
        studentId: dto.studentId,
        classId: dto.classId,
        academicYearId: dto.academicYearId,
        rollNumber: dto.rollNumber,
      },
    });
  }

  async findAll(query: QueryEnrollmentsDto): Promise<Enrollment[]> {
    return this.prisma.enrollment.findMany({
      where: {
        studentId: query.studentId,
        classId: query.classId,
        academicYearId: query.academicYearId,
      },
      orderBy: { enrollmentDate: 'desc' },
    });
  }

  async findById(id: string): Promise<Enrollment> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return enrollment;
  }

  async update(id: string, dto: UpdateEnrollmentDto): Promise<Enrollment> {
    await this.findById(id);

    return this.prisma.enrollment.update({
      where: { id },
      data: dto,
    });
  }
}
