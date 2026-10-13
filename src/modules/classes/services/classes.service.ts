import { Injectable, NotFoundException } from '@nestjs/common';
import { EnrollmentStatus, Prisma, type Class } from '@prisma/client';
import { OptionItemDto } from '../../../common/dto/option-item.dto';
import { PrismaService } from '../../../database/prisma.service';
import { ClassOptionSearchDto } from '../dto/class-option-search.dto';
import { EnrollmentWithStudent } from '../dto/class-roster-entry.dto';
import { CreateClassDto } from '../dto/create-class.dto';
import { UpdateClassDto } from '../dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClassDto): Promise<Class> {
    return this.prisma.class.create({
      data: {
        name: dto.name,
        section: dto.section,
        academicYearId: dto.academicYearId,
        classTeacherId: dto.classTeacherId,
      },
    });
  }

  async findAll(academicYearId?: string): Promise<Class[]> {
    return this.prisma.class.findMany({
      where: academicYearId ? { academicYearId } : undefined,
      orderBy: [{ name: 'asc' }, { section: 'asc' }],
    });
  }

  async findById(id: string): Promise<Class> {
    const klass = await this.prisma.class.findUnique({ where: { id } });

    if (!klass) {
      throw new NotFoundException('Class not found');
    }

    return klass;
  }

  async update(id: string, dto: UpdateClassDto): Promise<Class> {
    await this.findById(id);

    return this.prisma.class.update({
      where: { id },
      data: {
        name: dto.name,
        section: dto.section,
        classTeacherId: dto.classTeacherId,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);

    await this.prisma.class.delete({ where: { id } });
  }

  async findRoster(id: string): Promise<EnrollmentWithStudent[]> {
    await this.findById(id);

    return this.prisma.enrollment.findMany({
      where: { classId: id, status: EnrollmentStatus.ACTIVE },
      include: { student: true },
      orderBy: { rollNumber: 'asc' },
    });
  }

  /**
   * Returns {id, name} pairs for dropdown/autocomplete pickers. "name" is
   * the combined "<name> - <section>" label since a class isn't unique
   * without its section (e.g. "Grade 5 - A").
   */
  async findOptions(dto: ClassOptionSearchDto): Promise<OptionItemDto[]> {
    const keywordFilter: Prisma.ClassWhereInput | undefined = dto.keyword
      ? {
          OR: [
            { name: { contains: dto.keyword, mode: 'insensitive' } },
            { section: { contains: dto.keyword, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const classes = await this.prisma.class.findMany({
      where: {
        academicYearId: dto.academicYearId,
        ...keywordFilter,
      },
      orderBy: [{ name: 'asc' }, { section: 'asc' }],
      take: 50,
    });

    return classes.map(
      (klass) =>
        new OptionItemDto(klass.id, `${klass.name} - ${klass.section}`),
    );
  }
}
