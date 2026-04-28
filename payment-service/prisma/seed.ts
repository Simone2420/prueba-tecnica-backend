import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database with initial merchants...');

  const merchantA = await prisma.merchant.upsert({
    where: { email: 'merchant.a@example.com' },
    update: {},
    create: {
      name: 'Merchant A (Test)',
      email: 'merchant.a@example.com',
      api_key: crypto.randomUUID(),
      status: 'active',
    },
  });

  const merchantB = await prisma.merchant.upsert({
    where: { email: 'merchant.b@example.com' },
    update: {},
    create: {
      name: 'Merchant B (Test)',
      email: 'merchant.b@example.com',
      api_key: crypto.randomUUID(),
      status: 'active',
    },
  });

  console.log({ merchantA, merchantB });
  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
