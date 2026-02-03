import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  console.log('🌱 Starting seed...');

  const patronHash = bcrypt.hashSync('patron123', SALT_ROUNDS);
  const djHash = bcrypt.hashSync('dj123', SALT_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email: 'patron@test.com' },
    update: {},
    create: {
      email: 'patron@test.com',
      passwordHash: patronHash,
      name: 'Patron One',
    },
  });
  console.log('✅ Patron:', user.email);

  const dj = await prisma.dJ.upsert({
    where: { email: 'dj@test.com' },
    update: {},
    create: {
      email: 'dj@test.com',
      passwordHash: djHash,
      name: 'DJ Test',
    },
  });
  console.log('✅ DJ:', dj.email);

  const venue = await prisma.venue.upsert({
    where: { id: 'seed-venue-1' },
    update: {},
    create: {
      id: 'seed-venue-1',
      name: 'The Demo Venue',
      address: '123 Demo St',
    },
  });
  console.log('✅ Venue:', venue.name);

  await prisma.venueDJ.upsert({
    where: { venueId_djId: { venueId: venue.id, djId: dj.id } },
    update: {},
    create: { venueId: venue.id, djId: dj.id },
  });
  console.log('✅ VenueDJ link created');

  console.log('✨ Seed completed!');
  console.log('  Patron: patron@test.com / patron123');
  console.log('  DJ:     dj@test.com / dj123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
