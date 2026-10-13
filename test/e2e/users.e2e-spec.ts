import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  ADMIN_CREDENTIALS,
  cleanDatabase,
  createTestApp,
  loginAsAdmin,
} from './utils/test-app';

describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await cleanDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  async function getAdminIdAndToken(): Promise<{
    accessToken: string;
    id: string;
  }> {
    const accessToken = await loginAsAdmin(app);
    const me = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    return { accessToken, id: me.body.id };
  }

  describe('GET /api/v1/users/:id', () => {
    it('returns the user when the id exists', async () => {
      const { id, accessToken } = await getAdminIdAndToken();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(id);
      expect(response.body.email).toBe(ADMIN_CREDENTIALS.email);
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('returns 404 when the id does not exist', async () => {
      const { accessToken } = await getAdminIdAndToken();

      await request(app.getHttpServer())
        .get('/api/v1/users/11111111-1111-1111-1111-111111111111')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('returns 400 when the id is not a valid UUID', async () => {
      const { accessToken } = await getAdminIdAndToken();

      await request(app.getHttpServer())
        .get('/api/v1/users/not-a-uuid')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('returns 401 without a token', async () => {
      const { id } = await getAdminIdAndToken();

      await request(app.getHttpServer()).get(`/api/v1/users/${id}`).expect(401);
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('returns the authenticated user', async () => {
      const { accessToken, id } = await getAdminIdAndToken();

      const response = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(id);
    });

    it('returns 401 without a token', async () => {
      await request(app.getHttpServer()).get('/api/v1/users/me').expect(401);
    });
  });

  describe('PATCH /api/v1/users/me', () => {
    it('updates the authenticated user', async () => {
      const { accessToken } = await getAdminIdAndToken();

      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ firstName: 'Updated' })
        .expect(200);

      expect(response.body.firstName).toBe('Updated');
    });
  });

  describe('DELETE /api/v1/users/me', () => {
    it('deletes the authenticated user', async () => {
      const { accessToken, id } = await getAdminIdAndToken();

      await request(app.getHttpServer())
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/v1/users/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });
  });
});
