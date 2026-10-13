import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { cleanDatabase, createTestApp, loginAsAdmin } from './utils/test-app';

describe('Students (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let classId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    adminToken = await loginAsAdmin(app);

    const year = await request(app.getHttpServer())
      .post('/api/v1/academic-years')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        label: '2025-2026',
        startDate: '2025-04-01',
        endDate: '2026-03-31',
      });

    const klass = await request(app.getHttpServer())
      .post('/api/v1/classes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Grade 5', section: 'A', academicYearId: year.body.id });

    classId = klass.body.id as string;
  });

  afterEach(async () => {
    await cleanDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  function admissionPayload(): Record<string, unknown> {
    return {
      fullName: 'Aarav Sharma',
      dateOfBirth: '2015-08-15',
      admissionForClass: '5th',
      category: 'GEN',
      residentialAddress: '123 Main St, Jabalpur',
      fatherName: 'Rajesh Sharma',
      motherName: 'Sunita Sharma',
      scholarNumber: 'SCH-2025-0001',
      admissionDate: '2025-04-10',
      admissionClassId: classId,
    };
  }

  describe('POST /api/v1/students', () => {
    it('admits a new student', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(admissionPayload())
        .expect(201);

      expect(response.body.fullName).toBe('Aarav Sharma');
      expect(response.body.scholarNumber).toBe('SCH-2025-0001');
      expect(response.body.admissionClassId).toBe(classId);
      expect(response.body.status).toBe('ACTIVE');
    });

    it('rejects a duplicate scholar number with 409', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(admissionPayload())
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...admissionPayload(), fullName: 'Another Student' })
        .expect(409);
    });

    it('rejects an invalid category with 400', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...admissionPayload(), category: 'NOT_A_CATEGORY' })
        .expect(400);
    });

    it('rejects a non-existent admissionClassId with 400 or 404', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...admissionPayload(),
          admissionClassId: '11111111-1111-1111-1111-111111111111',
        });

      expect([400, 404]).toContain(response.status);
    });

    it('rejects the request with 403 for a non-admin caller', async () => {
      const teacher = await request(app.getHttpServer())
        .post('/api/v1/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'teacher1@tridevconvent.local',
          password: 'TeacherP@ss1',
          firstName: 'Meera',
          lastName: 'Patel',
        });
      const login = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: teacher.body.email, password: 'TeacherP@ss1' });

      await request(app.getHttpServer())
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${login.body.accessToken}`)
        .send(admissionPayload())
        .expect(403);
    });
  });

  describe('PATCH /api/v1/students/:id/discharge', () => {
    it('discharges a student and records the register fields', async () => {
      const student = await request(app.getHttpServer())
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(admissionPayload());

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/students/${student.body.id}/discharge`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dischargeDate: '2027-03-31',
          dischargeClass: '6th',
          dischargeCause: 'Family relocated',
        })
        .expect(200);

      expect(response.body.status).toBe('DISCHARGED');
      expect(response.body.dischargeCause).toBe('Family relocated');
    });

    it('rejects discharge without a cause with 400', async () => {
      const student = await request(app.getHttpServer())
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(admissionPayload());

      await request(app.getHttpServer())
        .patch(`/api/v1/students/${student.body.id}/discharge`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ dischargeDate: '2027-03-31', dischargeClass: '6th' })
        .expect(400);
    });

    it('returns 404 for a non-existent student', async () => {
      await request(app.getHttpServer())
        .patch(
          '/api/v1/students/11111111-1111-1111-1111-111111111111/discharge',
        )
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dischargeDate: '2027-03-31',
          dischargeClass: '6th',
          dischargeCause: 'Relocated',
        })
        .expect(404);
    });
  });
});
