import { PrismaClient } from '../src/prisma/generated';

const prisma = new PrismaClient();

// Placeholder venue UUIDs -- replace once venue-service seeds are linked
const PLACEHOLDER_VENUE_KL = '00000000-0000-4000-a000-000000000001';
const PLACEHOLDER_VENUE_KL_2 = '00000000-0000-4000-a000-000000000002';
const PLACEHOLDER_VENUE_KL_3 = '00000000-0000-4000-a000-000000000003';
const PLACEHOLDER_VENUE_LK = '00000000-0000-4000-a000-000000000011';
const PLACEHOLDER_VENUE_LK_2 = '00000000-0000-4000-a000-000000000012';

async function main() {
  const events = [
    // ---------- KL events (7) ----------
    {
      name: 'Saturday Night EDM',
      venueId: PLACEHOLDER_VENUE_KL,
      date: new Date('2026-04-18'),
      startTime: '22:00',
      endTime: '03:00',
      country: 'MY',
      status: 'upcoming' as const,
      description:
        'The biggest EDM night in Bukit Bintang featuring international guest DJs and full LED production.',
    },
    {
      name: 'Rooftop Sunset Sessions',
      venueId: PLACEHOLDER_VENUE_KL_2,
      date: new Date('2026-04-19'),
      startTime: '17:00',
      endTime: '23:00',
      country: 'MY',
      status: 'upcoming' as const,
      description:
        'Chill deep-house beats as the sun sets over the KL skyline. Complimentary welcome drink included.',
    },
    {
      name: 'Jazz & Cocktails Night',
      venueId: PLACEHOLDER_VENUE_KL_3,
      date: new Date('2026-04-25'),
      startTime: '20:00',
      endTime: '01:00',
      country: 'MY',
      status: 'upcoming' as const,
      description:
        'Live jazz quartet paired with craft cocktails in an intimate speakeasy setting.',
    },
    {
      name: 'Techno Underground',
      venueId: PLACEHOLDER_VENUE_KL,
      date: new Date('2026-05-02'),
      startTime: '23:00',
      endTime: '05:00',
      country: 'MY',
      status: 'upcoming' as const,
      description:
        'Warehouse-style techno party deep in the Klang Valley with three stages and international headliners.',
    },
    {
      name: 'Afrobeats Fiesta',
      venueId: PLACEHOLDER_VENUE_KL_2,
      date: new Date('2026-05-03'),
      startTime: '21:00',
      endTime: '03:00',
      country: 'MY',
      status: 'upcoming' as const,
      description:
        'Afrobeats and amapiano takeover on the Changkat strip with guest performers from Lagos.',
    },
    {
      name: 'Neon Rave KL',
      venueId: PLACEHOLDER_VENUE_KL_3,
      date: new Date('2026-05-09'),
      startTime: '22:00',
      endTime: '04:00',
      country: 'MY',
      status: 'upcoming' as const,
      description:
        'UV paint, neon lasers, and high-energy trance -- KLs wildest rave returns for its 5th edition.',
    },
    {
      name: 'Bangsar Latin Nights',
      venueId: PLACEHOLDER_VENUE_KL,
      date: new Date('2026-05-16'),
      startTime: '20:30',
      endTime: '02:00',
      country: 'MY',
      status: 'upcoming' as const,
      description:
        'Salsa, bachata, and reggaeton night with live percussion and dance workshops from 8:30 PM.',
    },

    // ---------- Colombo events (3) ----------
    {
      name: 'Galle Face Pool Party',
      venueId: PLACEHOLDER_VENUE_LK,
      date: new Date('2026-04-26'),
      startTime: '14:00',
      endTime: '22:00',
      country: 'LK',
      status: 'upcoming' as const,
      description:
        'Colombos premier poolside day party with tropical house DJs and seafood BBQ.',
    },
    {
      name: 'Colombo After Dark',
      venueId: PLACEHOLDER_VENUE_LK_2,
      date: new Date('2026-05-10'),
      startTime: '22:00',
      endTime: '04:00',
      country: 'LK',
      status: 'upcoming' as const,
      description:
        'Underground electronic night in Colombo Fort district featuring the islands top selectors.',
    },
    {
      name: 'Baila Beats Festival',
      venueId: PLACEHOLDER_VENUE_LK,
      date: new Date('2026-05-17'),
      startTime: '18:00',
      endTime: '01:00',
      country: 'LK',
      status: 'upcoming' as const,
      description:
        'A celebration of Sri Lankan baila culture fused with modern dance music on the beach.',
    },
  ];

  console.log('Seeding events...');

  for (const event of events) {
    const created = await prisma.event.create({
      data: {
        name: event.name,
        venueId: event.venueId,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        country: event.country,
        status: event.status,
        description: event.description,
      },
    });
    console.log(`  Created: ${created.name} (${event.country}, ${event.date.toISOString().split('T')[0]})`);
  }

  console.log(`Seeded ${events.length} events.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
