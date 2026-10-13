import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { cleanDatabase, createTestApp, loginAsAdmin } from './utils/test-app';

describe('Teachers (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  const teacherPayload = {
    email: 'teacher1@tridevconvent.local',
    password: 'TeacherP@ss1',
    firstName: 'Meera',
    lastName: 'Patel',
    employeeCode: 'EMP-001',
  };

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

  async function createTeacherAndLogin(): Promise<{
    id: string;
    token: string;
  }> {
    const created = await request(app.getHttpServer())
      .post('/api/v1/teachers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(teacherPayload);

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: teacherPayload.email, password: teacherPayload.password });

    return {
      id: created.body.id as string,
      token: login.body.accessToken as string,
    };
  }

  describe('POST /api/v1/teachers', () => {
    it('creates a teacher login account as admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(teacherPayload)
        .expect(201);

      expect(response.body.email).toBe(teacherPayload.email);
      expect(response.body.employeeCode).toBe(teacherPayload.employeeCode);
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('rejects a duplicate email with 409', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(teacherPayload)
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(teacherPayload)
        .expect(409);
    });

    it('rejects the request with 403 when called by a TEACHER', async () => {
      const { token } = await createTeacherAndLogin();

      await request(app.getHttpServer())
        .post('/api/v1/teachers')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...teacherPayload, email: 'another@tridevconvent.local' })
        .expect(403);
    });

    it('rejects the request with 401 when unauthenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/teachers')
        .send(teacherPayload)
        .expect(401);
    });
  });

  describe('GET /api/v1/teachers', () => {
    it('is readable by a TEACHER (not just ADMIN)', async () => {
      const { token } = await createTeacherAndLogin();

      const response = await request(app.getHttpServer())
        .get('/api/v1/teachers')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('DELETE /api/v1/teachers/:id', () => {
    it('removes the teacher and their login account', async () => {
      const { id } = await createTeacherAndLogin();

      await request(app.getHttpServer())
        .delete(`/api/v1/teachers/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/v1/teachers/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
