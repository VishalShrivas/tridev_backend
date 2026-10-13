import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { cleanDatabase, createTestApp, loginAsAdmin } from './utils/test-app';

describe('AcademicYears (e2e)', () => {
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

  async function createYear(label: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/academic-years')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ label, startDate: '2025-04-01', endDate: '2026-03-31' });

    return response.body.id as string;
  }

  describe('POST /api/v1/academic-years', () => {
    it('creates an academic year', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/academic-years')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          label: '2025-2026',
          startDate: '2025-04-01',
          endDate: '2026-03-31',
        })
        .expect(201);

      expect(response.body.label).toBe('2025-2026');
      expect(response.body.isCurrent).toBe(false);
    });

    it('rejects a duplicate label with 409', async () => {
      await createYear('2025-2026');

      await request(app.getHttpServer())
        .post('/api/v1/academic-years')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          label: '2025-2026',
          startDate: '2025-04-01',
          endDate: '2026-03-31',
        })
        .expect(409);
    });
  });

  describe('GET /api/v1/academic-years/current', () => {
    it('returns 404 when no year is set as current', async () => {
      await createYear('2025-2026');

      await request(app.getHttpServer())
        .get('/api/v1/academic-years/current')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('returns the year marked current', async () => {
      const id = await createYear('2025-2026');

      await request(app.getHttpServer())
        .patch(`/api/v1/academic-years/${id}/set-current`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get('/api/v1/academic-years/current')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(id);
    });
  });

  describe('PATCH /api/v1/academic-years/:id/set-current', () => {
    it('unsets the previous current year when a new one is set', async () => {
      const firstId = await createYear('2025-2026');
      const secondId = await createYear('2026-2027');

      await request(app.getHttpServer())
        .patch(`/api/v1/academic-years/${firstId}/set-current`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/api/v1/academic-years/${secondId}/set-current`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const firstYear = await request(app.getHttpServer())
        .get(`/api/v1/academic-years/${firstId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      const secondYear = await request(app.getHttpServer())
        .get(`/api/v1/academic-years/${secondId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(firstYear.body.isCurrent).toBe(false);
      expect(secondYear.body.isCurrent).toBe(true);
    });
  });
});
