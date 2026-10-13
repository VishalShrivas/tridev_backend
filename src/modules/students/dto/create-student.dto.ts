import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category, Nationality } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateStudentDto {
  // Candidate particulars
  @ApiProperty({ example: 'Aarav Sharma' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  fullName!: string;

  @ApiPropertyOptional({ example: 'आरव शर्मा' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fullNameHindi?: string;

  @ApiProperty({ example: '2015-08-15' })
  @IsDateString()
  dateOfBirth!: string;

  @ApiProperty({ example: '5th' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  admissionForClass!: string;

  @ApiProperty({ enum: Category })
  @IsEnum(Category)
  category!: Category;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  caste?: string;

  @ApiPropertyOptional({ example: 'Hindi' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  motherTongue?: string;

  @ApiPropertyOptional({ example: 'Hindu' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  religion?: string;

  @ApiPropertyOptional({ enum: Nationality, default: Nationality.INDIAN })
  @IsOptional()
  @IsEnum(Nationality)
  nationality?: Nationality;

  @ApiPropertyOptional({ example: '123456789012' })
  @IsOptional()
  @IsNumberString()
  @MinLength(12)
  @MaxLength(12)
  aadharNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  samagraId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  samagraFamilyId?: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  mobileNumber?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  residentialAddress!: string;

  // Previous school info (class 2nd and onward)
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  previousClassPassed?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  previousMarksObtained?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  previousSchoolName?: string;

  // Parent info — father
  @ApiProperty({ example: 'Rajesh Sharma' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  fatherName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fatherNameHindi?: string;

  @ApiPropertyOptional({ example: '123456789012' })
  @IsOptional()
  @IsNumberString()
  @MinLength(12)
  @MaxLength(12)
  fatherAadhar?: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  fatherMobile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fatherQualification?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fatherOccupation?: string;

  // Parent info — mother
  @ApiProperty({ example: 'Sunita Sharma' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  motherName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  motherNameHindi?: string;

  @ApiPropertyOptional({ example: '123456789012' })
  @IsOptional()
  @IsNumberString()
  @MinLength(12)
  @MaxLength(12)
  motherAadhar?: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  motherMobile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  motherQualification?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  motherOccupation?: string;

  // Family financial info
  @ApiPropertyOptional({ example: '25000.00' })
  @IsOptional()
  @IsNumberString()
  familyMonthlyIncome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankBranch?: string;

  @ApiPropertyOptional({ example: 'SBIN0001234' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  bankIfscCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  bankAccountNumber?: string;

  // Documents submitted checklist
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  docDobCertificate?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  docCasteCertificate?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  docSamagraId?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  docAadharCard?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  docBplCard?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  docBankAccount?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  docTcAndMarksheet?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  docPassportPhotos?: boolean;

  // Office use / admission processing
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  eligibleForAdmission?: boolean;

  // Additional national/state IDs
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  aaparId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ladliNumber?: string;

  // Admission & Discharge register fields
  @ApiProperty({ example: 'SCH-2025-0001' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  scholarNumber!: string;

  @ApiProperty({ example: '2025-04-10' })
  @IsDateString()
  admissionDate!: string;

  @ApiProperty({ format: 'uuid', description: 'ID of the Class admitted into' })
  @IsUUID()
  admissionClassId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}
