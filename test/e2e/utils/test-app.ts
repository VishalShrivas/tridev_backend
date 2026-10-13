import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import * as argon2 from 'argon2';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/database/prisma.service';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.init();
  return app;
}

/**
 * Deletes rows in FK-safe order (children before parents). Enrollment must
 * go before Student/Class/AcademicYear; Teacher/Class before User; etc.
 */
export async function cleanDatabase(app: INestApplication): Promise<void> {
  const prisma = app.get(PrismaService);
  await prisma.enrollment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.class.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.user.deleteMany();
}

export const ADMIN_CREDENTIALS = {
  email: 'e2e-admin@tridevconvent.local',
  password: 'AdminP@ss123',
};

/**
 * Creates an ADMIN user directly (bypassing the API, which has no public
 * way to create the first admin — mirrors what prisma/seed.ts does) and
 * returns a bearer token for it, for tests that need admin-gated access.
 */
export async function loginAsAdmin(app: INestApplication): Promise<string> {
  const prisma = app.get(PrismaService);
  const passwordHash = await argon2.hash(ADMIN_CREDENTIALS.password);

  await prisma.user.upsert({
    where: { email: ADMIN_CREDENTIALS.email },
    create: {
      email: ADMIN_CREDENTIALS.email,
      passwordHash,
      firstName: 'E2E',
      lastName: 'Admin',
      role: Role.ADMIN,
    },
    update: {},
  });

  const response = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send(ADMIN_CREDENTIALS);

  return response.body.accessToken as string;
}
