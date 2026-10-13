import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  Category,
  Nationality,
  StudentStatus,
  type Student,
} from '@prisma/client';

@Exclude()
export class StudentResponseDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  fullName: string;

  @ApiPropertyOptional()
  @Expose()
  fullNameHindi: string | null;

  @ApiPropertyOptional()
  @Expose()
  photoUrl: string | null;

  @ApiProperty()
  @Expose()
  dateOfBirth: Date;

  @ApiProperty()
  @Expose()
  admissionForClass: string;

  @ApiProperty({ enum: Category })
  @Expose()
  category: Category;

  @ApiPropertyOptional()
  @Expose()
  caste: string | null;

  @ApiPropertyOptional()
  @Expose()
  motherTongue: string | null;

  @ApiPropertyOptional()
  @Expose()
  religion: string | null;

  @ApiProperty({ enum: Nationality })
  @Expose()
  nationality: Nationality;

  @ApiPropertyOptional()
  @Expose()
  aadharNumber: string | null;

  @ApiPropertyOptional()
  @Expose()
  samagraId: string | null;

  @ApiPropertyOptional()
  @Expose()
  samagraFamilyId: string | null;

  @ApiPropertyOptional()
  @Expose()
  mobileNumber: string | null;

  @ApiProperty()
  @Expose()
  residentialAddress: string;

  @ApiPropertyOptional()
  @Expose()
  previousClassPassed: string | null;

  @ApiPropertyOptional()
  @Expose()
  previousMarksObtained: string | null;

  @ApiPropertyOptional()
  @Expose()
  previousSchoolName: string | null;

  @ApiProperty()
  @Expose()
  fatherName: string;

  @ApiPropertyOptional()
  @Expose()
  fatherNameHindi: string | null;

  @ApiPropertyOptional()
  @Expose()
  fatherAadhar: string | null;

  @ApiPropertyOptional()
  @Expose()
  fatherMobile: string | null;

  @ApiPropertyOptional()
  @Expose()
  fatherQualification: string | null;

  @ApiPropertyOptional()
  @Expose()
  fatherOccupation: string | null;

  @ApiProperty()
  @Expose()
  motherName: string;

  @ApiPropertyOptional()
  @Expose()
  motherNameHindi: string | null;

  @ApiPropertyOptional()
  @Expose()
  motherAadhar: string | null;

  @ApiPropertyOptional()
  @Expose()
  motherMobile: string | null;

  @ApiPropertyOptional()
  @Expose()
  motherQualification: string | null;

  @ApiPropertyOptional()
  @Expose()
  motherOccupation: string | null;

  @ApiPropertyOptional()
  @Expose()
  familyMonthlyIncome: string | null;

  @ApiPropertyOptional()
  @Expose()
  bankName: string | null;

  @ApiPropertyOptional()
  @Expose()
  bankBranch: string | null;

  @ApiPropertyOptional()
  @Expose()
  bankIfscCode: string | null;

  @ApiPropertyOptional()
  @Expose()
  bankAccountNumber: string | null;

  @ApiProperty()
  @Expose()
  docDobCertificate: boolean;

  @ApiProperty()
  @Expose()
  docCasteCertificate: boolean;

  @ApiProperty()
  @Expose()
  docSamagraId: boolean;

  @ApiProperty()
  @Expose()
  docAadharCard: boolean;

  @ApiProperty()
  @Expose()
  docBplCard: boolean;

  @ApiProperty()
  @Expose()
  docBankAccount: boolean;

  @ApiProperty()
  @Expose()
  docTcAndMarksheet: boolean;

  @ApiProperty()
  @Expose()
  docPassportPhotos: boolean;

  @ApiPropertyOptional()
  @Expose()
  eligibleForAdmission: boolean | null;

  @ApiPropertyOptional()
  @Expose()
  aaparId: string | null;

  @ApiPropertyOptional()
  @Expose()
  ladliNumber: string | null;

  @ApiProperty()
  @Expose()
  scholarNumber: string;

  @ApiProperty()
  @Expose()
  admissionDate: Date;

  @ApiProperty({ format: 'uuid' })
  @Expose()
  admissionClassId: string;

  @ApiProperty({ enum: StudentStatus })
  @Expose()
  status: StudentStatus;

  @ApiPropertyOptional()
  @Expose()
  dischargeDate: Date | null;

  @ApiPropertyOptional()
  @Expose()
  dischargeClass: string | null;

  @ApiPropertyOptional()
  @Expose()
  dischargeCause: string | null;

  @ApiPropertyOptional()
  @Expose()
  remarks: string | null;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  constructor(student: Student) {
    this.id = student.id;
    this.fullName = student.fullName;
    this.fullNameHindi = student.fullNameHindi;
    this.photoUrl = student.photoUrl;
    this.dateOfBirth = student.dateOfBirth;
    this.admissionForClass = student.admissionForClass;
    this.category = student.category;
    this.caste = student.caste;
    this.motherTongue = student.motherTongue;
    this.religion = student.religion;
    this.nationality = student.nationality;
    this.aadharNumber = student.aadharNumber;
    this.samagraId = student.samagraId;
    this.samagraFamilyId = student.samagraFamilyId;
    this.mobileNumber = student.mobileNumber;
    this.residentialAddress = student.residentialAddress;
    this.previousClassPassed = student.previousClassPassed;
    this.previousMarksObtained = student.previousMarksObtained;
    this.previousSchoolName = student.previousSchoolName;
    this.fatherName = student.fatherName;
    this.fatherNameHindi = student.fatherNameHindi;
    this.fatherAadhar = student.fatherAadhar;
    this.fatherMobile = student.fatherMobile;
    this.fatherQualification = student.fatherQualification;
    this.fatherOccupation = student.fatherOccupation;
    this.motherName = student.motherName;
    this.motherNameHindi = student.motherNameHindi;
    this.motherAadhar = student.motherAadhar;
    this.motherMobile = student.motherMobile;
    this.motherQualification = student.motherQualification;
    this.motherOccupation = student.motherOccupation;
    this.familyMonthlyIncome = student.familyMonthlyIncome?.toString() ?? null;
    this.bankName = student.bankName;
    this.bankBranch = student.bankBranch;
    this.bankIfscCode = student.bankIfscCode;
    this.bankAccountNumber = student.bankAccountNumber;
    this.docDobCertificate = student.docDobCertificate;
    this.docCasteCertificate = student.docCasteCertificate;
    this.docSamagraId = student.docSamagraId;
    this.docAadharCard = student.docAadharCard;
    this.docBplCard = student.docBplCard;
    this.docBankAccount = student.docBankAccount;
    this.docTcAndMarksheet = student.docTcAndMarksheet;
    this.docPassportPhotos = student.docPassportPhotos;
    this.eligibleForAdmission = student.eligibleForAdmission;
    this.aaparId = student.aaparId;
    this.ladliNumber = student.ladliNumber;
    this.scholarNumber = student.scholarNumber;
    this.admissionDate = student.admissionDate;
    this.admissionClassId = student.admissionClassId;
    this.status = student.status;
    this.dischargeDate = student.dischargeDate;
    this.dischargeClass = student.dischargeClass;
    this.dischargeCause = student.dischargeCause;
    this.remarks = student.remarks;
    this.createdAt = student.createdAt;
    this.updatedAt = student.updatedAt;
  }
}
