import { Injectable, NotFoundException } from '@nestjs/common';
import type { AcademicYear } from '@prisma/client';
import { OptionItemDto } from '../../../common/dto/option-item.dto';
import { OptionSearchDto } from '../../../common/dto/option-search.dto';
import { PrismaService } from '../../../database/prisma.service';
import { CreateAcademicYearDto } from '../dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from '../dto/update-academic-year.dto';

@Injectable()
export class AcademicYearsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAcademicYearDto): Promise<AcademicYear> {
    return this.prisma.academicYear.create({
      data: {
        label: dto.label,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }

  async findAll(): Promise<AcademicYear[]> {
    return this.prisma.academicYear.findMany({
      orderBy: { startDate: 'desc' },
    });
  }

  async findById(id: string): Promise<AcademicYear> {
    const year = await this.prisma.academicYear.findUnique({ where: { id } });

    if (!year) {
      throw new NotFoundException('Academic year not found');
    }

    return year;
  }

  async findCurrent(): Promise<AcademicYear> {
    const year = await this.prisma.academicYear.findFirst({
      where: { isCurrent: true },
    });

    if (!year) {
      throw new NotFoundException(
        'No academic year is currently set as active',
      );
    }

    return year;
  }

  async update(id: string, dto: UpdateAcademicYearDto): Promise<AcademicYear> {
    await this.findById(id);

    return this.prisma.academicYear.update({
      where: { id },
      data: {
        label: dto.label,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  /**
   * Marks the given year as the current one, unsetting any previously
   * current year. Enforced in a transaction rather than a DB constraint —
   * simpler than a partial unique index for a single-admin workflow.
   */
  async setCurrent(id: string): Promise<AcademicYear> {
    await this.findById(id);

    const [, year] = await this.prisma.$transaction([
      this.prisma.academicYear.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      }),
      this.prisma.academicYear.update({
        where: { id },
        data: { isCurrent: true },
      }),
    ]);

    return year;
  }

  /**
   * Returns {id, name} pairs for dropdown/autocomplete pickers. "name" is
   * the year label (e.g. "2025-2026").
   */
  async findOptions(dto: OptionSearchDto): Promise<OptionItemDto[]> {
    const years = await this.prisma.academicYear.findMany({
      where: dto.keyword
        ? { label: { contains: dto.keyword, mode: 'insensitive' } }
        : undefined,
      orderBy: { startDate: 'desc' },
      take: 50,
    });

    return years.map((year) => new OptionItemDto(year.id, year.label));
  }
}
