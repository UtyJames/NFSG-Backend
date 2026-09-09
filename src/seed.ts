/**
 * NFSG Platform – Database Seed Script
 * Creates the Super Admin account.
 * Run with: npx ts-node -r tsconfig-paths/register src/seed.ts
 */

import { PrismaClient, AdminRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🌱  Seeding NFSG database...\n');

  const superAdminData = {
    fullName: 'Miracle Igbinoghene',
    username: 'NFSG-ICT Admin',
    email: 'nfsgadmin@gmail.com',
    password: 'admin2325',
    role: AdminRole.SUPER_ADMIN,
  };

  const existing = await prisma.adminUser.findFirst({
    where: {
      OR: [
        { email: superAdminData.email },
        { username: superAdminData.username },
      ],
    },
  });

  if (existing) {
    console.log(
      `✅  Super Admin already exists (${existing.email}). Skipping creation.`,
    );
  } else {
    const passwordHash = await bcrypt.hash(superAdminData.password, 12);

    const admin = await prisma.adminUser.create({
      data: {
        fullName: superAdminData.fullName,
        username: superAdminData.username,
        email: superAdminData.email,
        passwordHash,
        role: superAdminData.role,
      },
    });

    console.log('✅  Super Admin created successfully!');
    console.log('    Full Name :', admin.fullName);
    console.log('    Username  :', admin.username);
    console.log('    Email     :', admin.email);
    console.log('    Role      :', admin.role);
    console.log('    Password  :', superAdminData.password, '(change after first login!)\n');
  }

  console.log('✅  Seed complete.\n');
}

main()
  .catch(e => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
