import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

/**
 * Bootstraps the first ADMIN account from env vars. Idempotent — safe to
 * re-run; does nothing if an admin with this email already exists.
 * Required because admin-gated endpoints (teacher registration, student
 * admission, etc.) need an ADMIN to already exist.
 */
async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const firstName = process.env.ADMIN_FIRST_NAME ?? 'System';
  const lastName = process.env.ADMIN_LAST_NAME ?? 'Admin';

  if (!email || !password) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the bootstrap admin account',
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`Admin account already exists for ${email}, skipping.`);
    return;
  }

  const passwordHash = await argon2.hash(password);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role: Role.ADMIN,
    },
  });

  console.log(`Bootstrap admin account created for ${email}.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
