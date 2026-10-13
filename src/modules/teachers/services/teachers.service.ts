import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { Prisma, Role } from '@prisma/client';
import { OptionItemDto } from '../../../common/dto/option-item.dto';
import { OptionSearchDto } from '../../../common/dto/option-search.dto';
import { PrismaService } from '../../../database/prisma.service';
import { CreateTeacherDto } from '../dto/create-teacher.dto';
import { TeacherWithUser } from '../dto/teacher-response.dto';
import { UpdateTeacherDto } from '../dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTeacherDto): Promise<TeacherWithUser> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: Role.TEACHER,
        teacher: {
          create: {
            employeeCode: dto.employeeCode,
            phone: dto.phone,
            address: dto.address,
            qualification: dto.qualification,
            joiningDate: dto.joiningDate
              ? new Date(dto.joiningDate)
              : undefined,
          },
        },
      },
      include: { teacher: true },
    });

    // Guaranteed non-null: teacher is created in the same nested-write above.
    return this.findById(user.teacher!.id);
  }

  async findAll(): Promise<TeacherWithUser[]> {
    const teachers = await this.prisma.teacher.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    return teachers;
  }

  async findById(id: string): Promise<TeacherWithUser> {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return teacher;
  }

  async update(id: string, dto: UpdateTeacherDto): Promise<TeacherWithUser> {
    await this.findById(id);

    const teacher = await this.prisma.teacher.update({
      where: { id },
      data: {
        employeeCode: dto.employeeCode,
        phone: dto.phone,
        address: dto.address,
        qualification: dto.qualification,
        joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : undefined,
        user: {
          update: {
            firstName: dto.firstName,
            lastName: dto.lastName,
          },
        },
      },
      include: { user: true },
    });

    return teacher;
  }

  async remove(id: string): Promise<void> {
    const teacher = await this.findById(id);

    // Cascades to delete the Teacher row too (Teacher.user has onDelete: Cascade).
    await this.prisma.user.delete({ where: { id: teacher.userId } });
  }

  /**
   * Returns {id, name} pairs for dropdown/autocomplete pickers (e.g.
   * assigning a class teacher). "name" is the teacher's full name.
   */
  async findOptions(dto: OptionSearchDto): Promise<OptionItemDto[]> {
    const keywordFilter: Prisma.UserWhereInput | undefined = dto.keyword
      ? {
          OR: [
            { firstName: { contains: dto.keyword, mode: 'insensitive' } },
            { lastName: { contains: dto.keyword, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const teachers = await this.prisma.teacher.findMany({
      where: { user: keywordFilter },
      include: { user: true },
      orderBy: { user: { firstName: 'asc' } },
      take: 50,
    });

    return teachers.map(
      (teacher) =>
        new OptionItemDto(
          teacher.id,
          `${teacher.user.firstName} ${teacher.user.lastName}`,
        ),
    );
  }
}
