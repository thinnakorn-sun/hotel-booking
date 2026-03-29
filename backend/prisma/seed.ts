import { PrismaClient } from '../src/generated/prisma-client';
import { suiteSeedRecords } from './seed-data';

const prisma = new PrismaClient();

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.suite.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.user.deleteMany();

  await prisma.suite.createMany({
    data: [...suiteSeedRecords],
  });

  await prisma.user.createMany({
    data: [
      {
        name: 'A. Director',
        email: 'director@majesticreserve.com',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      {
        name: 'S. Laurent',
        email: 'slaurent@majesticreserve.com',
        role: 'MANAGER',
        status: 'ACTIVE',
      },
      {
        name: 'M. Sterling',
        email: 'msterling@majesticreserve.com',
        role: 'STAFF',
        status: 'ACTIVE',
      },
      {
        name: 'E. Rostova',
        email: 'erostova@majesticreserve.com',
        role: 'STAFF',
        status: 'INACTIVE',
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
