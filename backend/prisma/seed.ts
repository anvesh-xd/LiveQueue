import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

const SEED_VENUES = [
  {
    id: 'venue-evolve',
    name: 'Evolve',
    address: 'Club night',
    logoUrl: '/club-logos/evolve.png',
  },
  {
    id: 'venue-vynx',
    name: 'VyNX',
    address: 'Club night',
    logoUrl: '/club-logos/vynx.png',
  },
  {
    id: 'venue-hyze',
    name: 'Hyze',
    address: 'Club night',
    logoUrl: '/club-logos/hyze.png',
  },
] as const;

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

  await prisma.venueDJ.deleteMany({ where: { venueId: 'seed-venue-1' } });
  await prisma.venue.deleteMany({ where: { id: 'seed-venue-1' } });

  for (const v of SEED_VENUES) {
    const venue = await prisma.venue.upsert({
      where: { id: v.id },
      update: {
        name: v.name,
        address: v.address,
        logoUrl: v.logoUrl,
      },
      create: {
        id: v.id,
        name: v.name,
        address: v.address,
        logoUrl: v.logoUrl,
      },
    });
    console.log('✅ Venue:', venue.name);

    await prisma.venueDJ.upsert({
      where: { venueId_djId: { venueId: venue.id, djId: dj.id } },
      update: {},
      create: { venueId: venue.id, djId: dj.id },
    });
  }
  console.log('✅ VenueDJ links for seed DJ');

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
