import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_FULL_NAME?.trim() || 'System Administrator';
  const country = process.env.ADMIN_COUNTRY?.trim() || 'Uganda';

  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in listing-backend/.env first.');
  }
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters long.');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      fullName,
      role: 'ADMIN',
      emailVerified: true
    },
    create: {
      email,
      passwordHash,
      fullName,
      dateOfBirth: new Date('1988-06-15'),
      country,
      role: 'ADMIN',
      emailVerified: true
    },
    select: { id: true, email: true, role: true }
  });

  console.log(`${existingUser ? 'Updated' : 'Created'} administrator account: ${user.email}`);
}

main()
  .catch((error) => {
    console.error('Admin provisioning failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
