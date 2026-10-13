import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import type { Teacher, User } from '@prisma/client';

export type TeacherWithUser = Teacher & { user: User };

@Exclude()
export class TeacherResponseDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  id: string;

  @ApiProperty({ format: 'uuid' })
  @Expose()
  userId: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiProperty()
  @Expose()
  lastName: string;

  @ApiPropertyOptional()
  @Expose()
  employeeCode: string | null;

  @ApiPropertyOptional()
  @Expose()
  phone: string | null;

  @ApiPropertyOptional()
  @Expose()
  address: string | null;

  @ApiPropertyOptional()
  @Expose()
  qualification: string | null;

  @ApiPropertyOptional()
  @Expose()
  joiningDate: Date | null;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  constructor(teacher: TeacherWithUser) {
    this.id = teacher.id;
    this.userId = teacher.userId;
    this.email = teacher.user.email;
    this.firstName = teacher.user.firstName;
    this.lastName = teacher.user.lastName;
    this.employeeCode = teacher.employeeCode;
    this.phone = teacher.phone;
    this.address = teacher.address;
    this.qualification = teacher.qualification;
    this.joiningDate = teacher.joiningDate;
    this.createdAt = teacher.createdAt;
    this.updatedAt = teacher.updatedAt;
  }
}
