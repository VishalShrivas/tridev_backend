import { Injectable, NotFoundException } from '@nestjs/common';
import { StudentStatus, type Student } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { CreateStudentDto } from '../dto/create-student.dto';
import { DischargeStudentDto } from '../dto/discharge-student.dto';
import { QueryStudentsDto } from '../dto/query-students.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStudentDto, photoUrl?: string): Promise<Student> {
    return this.prisma.student.create({
      data: {
        ...dto,
        dateOfBirth: new Date(dto.dateOfBirth),
        admissionDate: new Date(dto.admissionDate),
        familyMonthlyIncome: dto.familyMonthlyIncome,
        photoUrl,
      },
    });
  }

  async findAll(query: QueryStudentsDto): Promise<Student[]> {
    const { classId, academicYearId, status } = query;

    if (classId || academicYearId) {
      return this.prisma.student.findMany({
        where: {
          status,
          enrollments: {
            some: {
              classId,
              academicYearId,
            },
          },
        },
        orderBy: { fullName: 'asc' },
      });
    }

    return this.prisma.student.findMany({
      where: { status },
      orderBy: { fullName: 'asc' },
    });
  }

  async findById(id: string): Promise<Student> {
    const student = await this.prisma.student.findUnique({ where: { id } });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async update(
    id: string,
    dto: UpdateStudentDto,
    photoUrl?: string,
  ): Promise<Student> {
    await this.findById(id);

    return this.prisma.student.update({
      where: { id },
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        admissionDate: dto.admissionDate
          ? new Date(dto.admissionDate)
          : undefined,
        familyMonthlyIncome: dto.familyMonthlyIncome,
        photoUrl,
      },
    });
  }

  async discharge(id: string, dto: DischargeStudentDto): Promise<Student> {
    await this.findById(id);

    return this.prisma.student.update({
      where: { id },
      data: {
        status: StudentStatus.DISCHARGED,
        dischargeDate: new Date(dto.dischargeDate),
        dischargeClass: dto.dischargeClass,
        dischargeCause: dto.dischargeCause,
        remarks: dto.remarks,
      },
    });
  }
}
