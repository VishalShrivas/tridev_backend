import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  ADMIN_CREDENTIALS,
  cleanDatabase,
  createTestApp,
  loginAsAdmin,
} from './utils/test-app';

describe('Auth (e2e)', () => {
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

  describe('POST /api/v1/auth/login', () => {
    it('logs in with valid credentials', async () => {
      await loginAsAdmin(app);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(ADMIN_CREDENTIALS)
        .expect(200);

      expect(response.body.accessToken).toEqual(expect.any(String));
      expect(response.body.user.email).toBe(ADMIN_CREDENTIALS.email);
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('rejects an incorrect password with 401', async () => {
      await loginAsAdmin(app);

      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: ADMIN_CREDENTIALS.email, password: 'WrongPassword' })
        .expect(401);
    });

    it('rejects a non-existent email with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@example.com', password: 'whatever123' })
        .expect(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns the current user when authenticated', async () => {
      const accessToken = await loginAsAdmin(app);

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.email).toBe(ADMIN_CREDENTIALS.email);
      expect(response.body.role).toBe('ADMIN');
    });

    it('rejects the request with 401 when no token is provided', async () => {
      await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    });

    it('rejects the request with 401 when the token is invalid', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);
    });
  });

  it('POST /api/v1/auth/register no longer exists (accounts are admin-provisioned)', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'x@example.com', password: 'whatever123' })
      .expect(404);
  });
});
