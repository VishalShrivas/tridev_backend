import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Category,
  Nationality,
  StudentStatus,
  type Student,
} from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { StudentsService } from './students.service';

describe('StudentsService', () => {
  let service: StudentsService;
  let prisma: {
    student: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  const mockStudent: Student = {
    id: 'student-1',
    fullName: 'Aarav Sharma',
    fullNameHindi: null,
    photoUrl: null,
    dateOfBirth: new Date('2015-08-15'),
    admissionForClass: '5th',
    category: Category.GEN,
    caste: null,
    motherTongue: null,
    religion: null,
    nationality: Nationality.INDIAN,
    aadharNumber: null,
    samagraId: null,
    samagraFamilyId: null,
    mobileNumber: null,
    residentialAddress: '123 Main St',
    previousClassPassed: null,
    previousMarksObtained: null,
    previousSchoolName: null,
    fatherName: 'Rajesh Sharma',
    fatherNameHindi: null,
    fatherAadhar: null,
    fatherMobile: null,
    fatherQualification: null,
    fatherOccupation: null,
    motherName: 'Sunita Sharma',
    motherNameHindi: null,
    motherAadhar: null,
    motherMobile: null,
    motherQualification: null,
    motherOccupation: null,
    familyMonthlyIncome: null,
    bankName: null,
    bankBranch: null,
    bankIfscCode: null,
    bankAccountNumber: null,
    docDobCertificate: false,
    docCasteCertificate: false,
    docSamagraId: false,
    docAadharCard: false,
    docBplCard: false,
    docBankAccount: false,
    docTcAndMarksheet: false,
    docPassportPhotos: false,
    eligibleForAdmission: null,
    aaparId: null,
    ladliNumber: null,
    scholarNumber: 'SCH-2025-0001',
    admissionDate: new Date('2025-04-10'),
    admissionClassId: '22222222-2222-2222-2222-222222222222',
    status: StudentStatus.ACTIVE,
    dischargeDate: null,
    dischargeClass: null,
    dischargeCause: null,
    remarks: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      student: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(StudentsService);
  });

  describe('findById', () => {
    it('throws NotFoundException when the student does not exist', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(service.findById('missing-id')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('discharge', () => {
    it('throws NotFoundException when discharging a non-existent student', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(
        service.discharge('missing-id', {
          dischargeDate: '2027-03-31',
          dischargeClass: '6th',
          dischargeCause: 'Relocated',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.student.update).not.toHaveBeenCalled();
    });

    it('sets status to DISCHARGED with the register fields, not the generic update path', async () => {
      prisma.student.findUnique.mockResolvedValue(mockStudent);
      prisma.student.update.mockResolvedValue({
        ...mockStudent,
        status: StudentStatus.DISCHARGED,
      });

      await service.discharge(mockStudent.id, {
        dischargeDate: '2027-03-31',
        dischargeClass: '6th',
        dischargeCause: 'Relocated',
      });

      expect(prisma.student.update).toHaveBeenCalledWith({
        where: { id: mockStudent.id },
        data: {
          status: StudentStatus.DISCHARGED,
          dischargeDate: new Date('2027-03-31'),
          dischargeClass: '6th',
          dischargeCause: 'Relocated',
          remarks: undefined,
        },
      });
    });
  });
});
