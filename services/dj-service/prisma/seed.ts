import { PrismaClient } from '../src/prisma/generated';

const prisma = new PrismaClient();

async function main() {
  const djs = [
    // ---------- KL-based (10) ----------
    {
      name: 'DJ Reza K',
      slug: 'dj-reza-k',
      type: 'dj' as const,
      bio: 'Resident DJ at KLIA nightclub circuit known for progressive house and tech-house sets.',
      genreTags: ['tech-house', 'progressive-house'],
      instagramHandle: '@djrezak',
      country: 'MY',
      status: 'active' as const,
    },
    {
      name: 'DJ Mira Tan',
      slug: 'dj-mira-tan',
      type: 'dj' as const,
      bio: 'KL underground techno selector spinning dark minimal sets across Bukit Bintang clubs.',
      genreTags: ['techno', 'minimal', 'dark-techno'],
      instagramHandle: '@miratan.dj',
      country: 'MY',
      status: 'active' as const,
    },
    {
      name: 'Bassment Collective',
      slug: 'bassment-collective',
      type: 'band' as const,
      bio: 'Five-piece electronic-live band fusing drum & bass with live percussion and keys.',
      genreTags: ['drum-and-bass', 'live-electronic'],
      instagramHandle: '@bassmentcollective',
      country: 'MY',
      status: 'active' as const,
    },
    {
      name: 'DJ Hafiz Noor',
      slug: 'dj-hafiz-noor',
      type: 'dj' as const,
      bio: 'Open-format party DJ with residencies at multiple rooftop bars in Kuala Lumpur.',
      genreTags: ['open-format', 'hip-hop', 'r-and-b'],
      instagramHandle: '@hafiznoor',
      country: 'MY',
      status: 'active' as const,
    },
    {
      name: 'Neon Skyline',
      slug: 'neon-skyline',
      type: 'band' as const,
      bio: 'Synth-pop trio bringing retro-wave energy to KL rooftop venues every weekend.',
      genreTags: ['synth-pop', 'retro-wave'],
      instagramHandle: '@neonskylinekl',
      country: 'MY',
      status: 'active' as const,
    },
    {
      name: 'DJ Yuna Beats',
      slug: 'dj-yuna-beats',
      type: 'dj' as const,
      bio: 'Afrobeats and amapiano specialist turning Changkat clubs into dance floors.',
      genreTags: ['afrobeats', 'amapiano'],
      instagramHandle: '@yunabeats',
      country: 'MY',
      status: 'active' as const,
    },
    {
      name: 'DJ Kai Zen',
      slug: 'dj-kai-zen',
      type: 'dj' as const,
      bio: 'Trance and melodic techno DJ headlining warehouse events across the Klang Valley.',
      genreTags: ['trance', 'melodic-techno'],
      instagramHandle: '@djkaizen',
      country: 'MY',
      status: 'active' as const,
    },
    {
      name: 'The Velvet Groove',
      slug: 'the-velvet-groove',
      type: 'band' as const,
      bio: 'Jazz-funk quartet playing weekly residencies at premium KL cocktail lounges.',
      genreTags: ['jazz-funk', 'soul'],
      instagramHandle: '@velvetgroovekl',
      country: 'MY',
      status: 'active' as const,
    },
    {
      name: 'DJ Arif Shah',
      slug: 'dj-arif-shah',
      type: 'dj' as const,
      bio: 'EDM and big-room specialist behind some of the largest club nights in Bangsar.',
      genreTags: ['edm', 'big-room'],
      instagramHandle: '@arifshah.dj',
      country: 'MY',
      status: 'active' as const,
    },
    {
      name: 'DJ Suki Lin',
      slug: 'dj-suki-lin',
      type: 'dj' as const,
      bio: 'Deep house and nu-disco curator known for sunset sessions at TREC KL.',
      genreTags: ['deep-house', 'nu-disco'],
      instagramHandle: '@sukilin',
      country: 'MY',
      status: 'active' as const,
    },

    // ---------- Colombo-based (5) ----------
    {
      name: 'DJ Nishan De Silva',
      slug: 'dj-nishan-de-silva',
      type: 'dj' as const,
      bio: 'Colombo house music veteran spinning at the top hotel pool parties in Galle Face.',
      genreTags: ['house', 'tropical-house'],
      instagramHandle: '@nishandesilva',
      country: 'LK',
      status: 'active' as const,
    },
    {
      name: 'Colombo Brass Band',
      slug: 'colombo-brass-band',
      type: 'band' as const,
      bio: 'High-energy brass ensemble blending baila rhythms with modern dance music.',
      genreTags: ['baila', 'brass-dance'],
      instagramHandle: '@colombobrass',
      country: 'LK',
      status: 'active' as const,
    },
    {
      name: 'DJ Amara Jay',
      slug: 'dj-amara-jay',
      type: 'dj' as const,
      bio: 'Bollywood-remix and commercial DJ lighting up Colombo hotel nightclubs.',
      genreTags: ['bollywood-remix', 'commercial'],
      instagramHandle: '@amarajay.dj',
      country: 'LK',
      status: 'active' as const,
    },
    {
      name: 'DJ Tharindu Vibe',
      slug: 'dj-tharindu-vibe',
      type: 'dj' as const,
      bio: 'Techno and progressive DJ pushing the Colombo underground scene forward.',
      genreTags: ['techno', 'progressive'],
      instagramHandle: '@tharinduvibe',
      country: 'LK',
      status: 'active' as const,
    },
    {
      name: 'Island Frequency',
      slug: 'island-frequency',
      type: 'band' as const,
      bio: 'Electronic duo mixing Sri Lankan folk samples with deep house grooves.',
      genreTags: ['deep-house', 'world-fusion'],
      instagramHandle: '@islandfrequency',
      country: 'LK',
      status: 'active' as const,
    },
  ];

  console.log('Seeding DJ profiles...');

  for (const dj of djs) {
    await prisma.djProfile.upsert({
      where: { slug: dj.slug },
      update: {
        name: dj.name,
        type: dj.type,
        bio: dj.bio,
        genreTags: dj.genreTags,
        instagramHandle: dj.instagramHandle,
        country: dj.country,
        status: dj.status,
      },
      create: {
        name: dj.name,
        slug: dj.slug,
        type: dj.type,
        bio: dj.bio,
        genreTags: dj.genreTags,
        instagramHandle: dj.instagramHandle,
        country: dj.country,
        status: dj.status,
      },
    });
    console.log(`  Upserted: ${dj.name} (${dj.country})`);
  }

  console.log(`Seeded ${djs.length} DJ profiles.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
