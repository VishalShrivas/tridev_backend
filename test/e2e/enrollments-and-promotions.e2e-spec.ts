import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { cleanDatabase, createTestApp, loginAsAdmin } from './utils/test-app';

describe('Enrollments and Promotions (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    adminToken = await loginAsAdmin(app);
  });

  afterEach(async () => {
    await cleanDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  async function createYear(label: string, startDate: string, endDate: string) {
    const response = await request(app.getHttpServer())
      .post('/api/v1/academic-years')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ label, startDate, endDate });
    return response.body.id as string;
  }

  async function createClass(
    name: string,
    section: string,
    academicYearId: string,
  ) {
    const response = await request(app.getHttpServer())
      .post('/api/v1/classes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name, section, academicYearId });
    return response.body.id as string;
  }

  async function admitStudent(scholarNumber: string, admissionClassId: string) {
    const response = await request(app.getHttpServer())
      .post('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'Aarav Sharma',
        dateOfBirth: '2015-08-15',
        admissionForClass: '5th',
        category: 'GEN',
        residentialAddress: '123 Main St',
        fatherName: 'Rajesh Sharma',
        motherName: 'Sunita Sharma',
        scholarNumber,
        admissionDate: '2025-04-10',
        admissionClassId,
      });
    return response.body.id as string;
  }

  describe('POST /api/v1/enrollments', () => {
    it('enrolls a student into a class for a year, and it appears on the roster', async () => {
      const yearId = await createYear('2025-2026', '2025-04-01', '2026-03-31');
      const classId = await createClass('Grade 5', 'A', yearId);
      const studentId = await admitStudent('SCH-2025-0001', classId);

      await request(app.getHttpServer())
        .post('/api/v1/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ studentId, classId, academicYearId: yearId, rollNumber: '1' })
        .expect(201);

      const roster = await request(app.getHttpServer())
        .get(`/api/v1/classes/${classId}/students`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(roster.body).toHaveLength(1);
      expect(roster.body[0].student.id).toBe(studentId);
      expect(roster.body[0].rollNumber).toBe('1');
    });

    it('rejects a second enrollment for the same student in the same year with 409', async () => {
      const yearId = await createYear('2025-2026', '2025-04-01', '2026-03-31');
      const classA = await createClass('Grade 5', 'A', yearId);
      const classB = await createClass('Grade 5', 'B', yearId);
      const studentId = await admitStudent('SCH-2025-0001', classA);

      await request(app.getHttpServer())
        .post('/api/v1/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId,
          classId: classA,
          academicYearId: yearId,
          rollNumber: '1',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId,
          classId: classB,
          academicYearId: yearId,
          rollNumber: '2',
        })
        .expect(409);
    });
  });

  describe('POST /api/v1/promotions/bulk', () => {
    it('promotes a student: old enrollment becomes PROMOTED, a new ACTIVE enrollment is created, history is preserved', async () => {
      const year1 = await createYear('2025-2026', '2025-04-01', '2026-03-31');
      const year2 = await createYear('2026-2027', '2026-04-01', '2027-03-31');
      const class5A = await createClass('Grade 5', 'A', year1);
      const class6A = await createClass('Grade 6', 'A', year2);
      const studentId = await admitStudent('SCH-2025-0001', class5A);

      const enrollment1 = await request(app.getHttpServer())
        .post('/api/v1/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId,
          classId: class5A,
          academicYearId: year1,
          rollNumber: '1',
        });

      const result = await request(app.getHttpServer())
        .post('/api/v1/promotions/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fromAcademicYearId: year1,
          toAcademicYearId: year2,
          entries: [{ studentId, outcome: 'PROMOTED', newClassId: class6A }],
        })
        .expect(201);

      expect(result.body).toEqual([
        { studentId, success: true, newEnrollmentId: expect.any(String) },
      ]);

      const history = await request(app.getHttpServer())
        .get(`/api/v1/enrollments?studentId=${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(history.body).toHaveLength(2);
      const enrollments = history.body as Array<{
        id: string;
        status: string;
        classId: string;
        academicYearId: string;
      }>;
      const oldEnrollment = enrollments.find(
        (e) => e.id === enrollment1.body.id,
      );
      const newEnrollment = enrollments.find(
        (e) => e.id === result.body[0].newEnrollmentId,
      );

      expect(oldEnrollment?.status).toBe('PROMOTED');
      expect(oldEnrollment?.classId).toBe(class5A);
      expect(newEnrollment?.status).toBe('ACTIVE');
      expect(newEnrollment?.classId).toBe(class6A);
      expect(newEnrollment?.academicYearId).toBe(year2);
    });

    it('reports a per-entry failure without failing the whole batch', async () => {
      const year1 = await createYear('2025-2026', '2025-04-01', '2026-03-31');
      const year2 = await createYear('2026-2027', '2026-04-01', '2027-03-31');
      const class5A = await createClass('Grade 5', 'A', year1);
      const class6A = await createClass('Grade 6', 'A', year2);
      const goodStudent = await admitStudent('SCH-2025-0001', class5A);
      const badStudent = await admitStudent('SCH-2025-0002', class5A);

      await request(app.getHttpServer())
        .post('/api/v1/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: goodStudent,
          classId: class5A,
          academicYearId: year1,
          rollNumber: '1',
        });
      // badStudent is intentionally never enrolled in year1.

      const result = await request(app.getHttpServer())
        .post('/api/v1/promotions/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fromAcademicYearId: year1,
          toAcademicYearId: year2,
          entries: [
            { studentId: badStudent, outcome: 'PROMOTED', newClassId: class6A },
            {
              studentId: goodStudent,
              outcome: 'PROMOTED',
              newClassId: class6A,
            },
          ],
        })
        .expect(201);

      expect(result.body[0]).toMatchObject({
        studentId: badStudent,
        success: false,
      });
      expect(result.body[1]).toMatchObject({
        studentId: goodStudent,
        success: true,
      });
    });

    it('does not create a new enrollment for a LEFT outcome', async () => {
      const year1 = await createYear('2025-2026', '2025-04-01', '2026-03-31');
      const year2 = await createYear('2026-2027', '2026-04-01', '2027-03-31');
      const class5A = await createClass('Grade 5', 'A', year1);
      const studentId = await admitStudent('SCH-2025-0001', class5A);

      await request(app.getHttpServer())
        .post('/api/v1/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId,
          classId: class5A,
          academicYearId: year1,
          rollNumber: '1',
        });

      await request(app.getHttpServer())
        .post('/api/v1/promotions/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fromAcademicYearId: year1,
          toAcademicYearId: year2,
          entries: [{ studentId, outcome: 'LEFT' }],
        })
        .expect(201);

      const history = await request(app.getHttpServer())
        .get(`/api/v1/enrollments?studentId=${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(history.body).toHaveLength(1);
      expect(history.body[0].status).toBe('LEFT');
    });
  });
});
