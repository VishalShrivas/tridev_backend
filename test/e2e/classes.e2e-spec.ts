import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { cleanDatabase, createTestApp, loginAsAdmin } from './utils/test-app';

describe('Classes (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let academicYearId: string;

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
    academicYearId = year.body.id as string;
  });

  afterEach(async () => {
    await cleanDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/classes', () => {
    it('creates a class within an academic year', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Grade 5', section: 'A', academicYearId })
        .expect(201);

      expect(response.body.name).toBe('Grade 5');
      expect(response.body.section).toBe('A');
    });

    it('rejects the same name/section twice in the same year with 409', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Grade 5', section: 'A', academicYearId })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Grade 5', section: 'A', academicYearId })
        .expect(409);
    });

    it('allows the same name/section in a different academic year', async () => {
      const otherYear = await request(app.getHttpServer())
        .post('/api/v1/academic-years')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          label: '2026-2027',
          startDate: '2026-04-01',
          endDate: '2027-03-31',
        });

      await request(app.getHttpServer())
        .post('/api/v1/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Grade 5', section: 'A', academicYearId })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Grade 5',
          section: 'A',
          academicYearId: otherYear.body.id,
        })
        .expect(201);
    });
  });

  describe('GET /api/v1/classes/:id/students', () => {
    it('returns an empty roster for a class with no enrollments', async () => {
      const klass = await request(app.getHttpServer())
        .post('/api/v1/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Grade 5', section: 'A', academicYearId });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/classes/${klass.body.id}/students`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('returns 404 for a non-existent class', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/classes/11111111-1111-1111-1111-111111111111/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
