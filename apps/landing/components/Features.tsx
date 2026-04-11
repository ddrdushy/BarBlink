'use client';

import { motion } from 'framer-motion';

type Feature = {
  icon: string;
  title: string;
  desc: string;
  accent?: React.ReactNode;
};

const features: Feature[] = [
  {
    icon: '📍',
    title: 'Live Crowd Meter',
    desc: 'See exactly how packed every bar is right now — updated every minute from real check-ins. No more guesswork.',
    accent: (
      <div className="flex gap-1.5 mt-4">
        <span className="text-[10.5px] font-semibold px-2 py-1 rounded-full bg-crowd-quiet/15 text-crowd-quiet">🟢 Quiet</span>
        <span className="text-[10.5px] font-semibold px-2 py-1 rounded-full bg-crowd-lively/15 text-crowd-lively">🟡 Lively</span>
        <span className="text-[10.5px] font-semibold px-2 py-1 rounded-full bg-crowd-packed/15 text-crowd-packed">🔴 Packed</span>
      </div>
    ),
  },
  {
    icon: '🎧',
    title: 'DJ Discovery',
    desc: 'Follow your favourite DJs and live bands. Get pinged the moment they\'re booked at a KL venue tonight.',
    accent: (
      <div className="flex flex-wrap gap-1.5 mt-4">
        {['House', 'Techno', 'Hip-Hop', 'R&B', 'Live Jazz'].map((g) => (
          <span key={g} className="text-[10.5px] font-semibold px-2 py-1 rounded-full border border-white/10 text-white/70">
            {g}
          </span>
        ))}
      </div>
    ),
  },
  {
    icon: '👥',
    title: 'Track Your Crew',
    desc: 'See where your friends are checked in right now. Who\'s out tonight? Barblink already knows.',
    accent: (
      <div className="flex items-center gap-2 mt-4">
        <div className="flex -space-x-2">
          {['#C45AFF', '#FF6F91', '#2BC4FF', '#FFD166'].map((c, i) => (
            <div key={i} className="w-6 h-6 rounded-full ring-2 ring-bg-surface" style={{ background: c }} />
          ))}
        </div>
        <span className="text-[11px] text-ink-mute">4 friends at Zouk KL</span>
      </div>
    ),
  },
  {
    icon: '📸',
    title: 'The Blink Feed',
    desc: 'A social feed built only for nights out. Stories, drink ratings, check-ins, and moments — no politics, no ads, no noise.',
    accent: (
      <div className="flex items-center gap-2 mt-4 text-[11px] text-ink-mute">
        <span>📝 Posts</span><span className="w-1 h-1 rounded-full bg-white/20" />
        <span>⭐ Drink ratings</span><span className="w-1 h-1 rounded-full bg-white/20" />
        <span>📍 Check-ins</span>
      </div>
    ),
  },
  {
    icon: '🗺️',
    title: 'Nightlife Passport',
    desc: 'Every bar you visit, pinned on your personal KL map. Build your story. Share your scene. Earn regular status.',
    accent: (
      <div className="mt-4 flex items-center gap-2">
        <div className="text-neon font-display font-extrabold text-[24px] leading-none">23</div>
        <div className="text-[11px] text-ink-mute leading-tight">venues visited<br/>this year</div>
      </div>
    ),
  },
  {
    icon: '🔥',
    title: 'Weekly Leaderboards',
    desc: 'Who rules Bukit Bintang this week? Climb your neighbourhood leaderboard. Regulars get real bragging rights.',
    accent: (
      <div className="mt-4 space-y-1.5">
        {[
          { r: 1, n: 'kenji.kl', pts: '14' },
          { r: 2, n: 'nasha_', pts: '11' },
          { r: 3, n: 'you', pts: '9', me: true },
        ].map((x) => (
          <div key={x.r} className="flex items-center gap-2 text-[11px]">
            <span className={`w-5 font-display font-bold ${x.me ? 'text-neon' : 'text-white/60'}`}>#{x.r}</span>
            <span className={`flex-1 ${x.me ? 'text-white font-semibold' : 'text-white/60'}`}>@{x.n}</span>
            <span className={`${x.me ? 'text-neon' : 'text-white/50'}`}>{x.pts} nights</span>
          </div>
        ))}
      </div>
    ),
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-28 sm:py-36">
      <div className="container-xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <div className="eyebrow mb-4">Why Barblink</div>
            <h2 className="section-title">
              Everything your<br />
              night needs.
            </h2>
          </div>
          <p className="section-kicker md:text-right md:max-w-[420px]">
            Six tools, one app. All built around one simple idea: you deserve to
            know what's happening before you burn an Uber on the wrong venue.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.08 }}
              className="group relative rounded-[22px] p-6 sm:p-7 overflow-hidden transition-all hover:-translate-y-1"
              style={{
                background: 'linear-gradient(180deg, rgba(20,20,24,0.8), rgba(14,14,16,0.65))',
                border: '1px solid rgba(196, 90, 255, 0.14)',
              }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 50% 0%, rgba(196,90,255,0.18), transparent 60%)',
                }}
              />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-neon/15 flex items-center justify-center text-[22px] mb-5 group-hover:bg-neon/25 transition">
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-white text-[20px] tracking-tight mb-2">
                  {f.title}
                </h3>
                <p className="text-ink-mute text-[14px] leading-relaxed">{f.desc}</p>
                {f.accent}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
