import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import type { Class } from '@prisma/client';

@Exclude()
export class ClassResponseDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  section: string;

  @ApiProperty({ format: 'uuid' })
  @Expose()
  academicYearId: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @Expose()
  classTeacherId: string | null;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  constructor(klass: Class) {
    this.id = klass.id;
    this.name = klass.name;
    this.section = klass.section;
    this.academicYearId = klass.academicYearId;
    this.classTeacherId = klass.classTeacherId;
    this.createdAt = klass.createdAt;
    this.updatedAt = klass.updatedAt;
  }
}
