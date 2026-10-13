import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import type { AcademicYear } from '@prisma/client';

@Exclude()
export class AcademicYearResponseDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  label: string;

  @ApiProperty()
  @Expose()
  startDate: Date;

  @ApiProperty()
  @Expose()
  endDate: Date;

  @ApiProperty()
  @Expose()
  isCurrent: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  constructor(year: AcademicYear) {
    this.id = year.id;
    this.label = year.label;
    this.startDate = year.startDate;
    this.endDate = year.endDate;
    this.isCurrent = year.isCurrent;
    this.createdAt = year.createdAt;
    this.updatedAt = year.updatedAt;
  }
}
