import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import type { Enrollment, Student } from '@prisma/client';
import { StudentResponseDto } from '../../students/dto/student-response.dto';

export type EnrollmentWithStudent = Enrollment & { student: Student };

@Exclude()
export class ClassRosterEntryDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  enrollmentId: string;

  @ApiProperty()
  @Expose()
  rollNumber: string;

  @ApiProperty({ type: StudentResponseDto })
  @Expose()
  @Type(() => StudentResponseDto)
  student: StudentResponseDto;

  constructor(enrollment: EnrollmentWithStudent) {
    this.enrollmentId = enrollment.id;
    this.rollNumber = enrollment.rollNumber;
    this.student = new StudentResponseDto(enrollment.student);
  }
}
