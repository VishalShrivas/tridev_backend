import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { EnrollmentStatus, type Enrollment } from '@prisma/client';

@Exclude()
export class EnrollmentResponseDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Expose()
  studentId: string;

  @ApiProperty({ format: 'uuid' })
  @Expose()
  classId: string;

  @ApiProperty({ format: 'uuid' })
  @Expose()
  academicYearId: string;

  @ApiProperty()
  @Expose()
  rollNumber: string;

  @ApiProperty()
  @Expose()
  enrollmentDate: Date;

  @ApiProperty({ enum: EnrollmentStatus })
  @Expose()
  status: EnrollmentStatus;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  constructor(enrollment: Enrollment) {
    this.id = enrollment.id;
    this.studentId = enrollment.studentId;
    this.classId = enrollment.classId;
    this.academicYearId = enrollment.academicYearId;
    this.rollNumber = enrollment.rollNumber;
    this.enrollmentDate = enrollment.enrollmentDate;
    this.status = enrollment.status;
    this.createdAt = enrollment.createdAt;
    this.updatedAt = enrollment.updatedAt;
  }
}
