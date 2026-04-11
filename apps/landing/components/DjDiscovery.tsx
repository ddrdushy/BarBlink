'use client';

import { motion } from 'framer-motion';

const djs = [
  {
    name: 'KYRA',
    genre: 'House · Techno',
    venue: 'Zouk KL',
    time: 'Tonight · 11PM',
    rating: '4.9',
    color: 'from-[#C45AFF] to-[#7A2BBE]',
    initial: 'K',
    hot: true,
  },
  {
    name: 'LI BROTHERS',
    genre: 'Hip-Hop · R&B',
    venue: 'Kyo Bar',
    time: 'Tonight · 10PM',
    rating: '4.7',
    color: 'from-[#FF6F91] to-[#C93D74]',
    initial: 'L',
    hot: false,
  },
  {
    name: 'SAXMAN KL',
    genre: 'Live Jazz',
    venue: 'Taps Beer Bar',
    time: 'Sat · 9PM',
    rating: '4.8',
    color: 'from-[#FFD166] to-[#E8A030]',
    initial: 'S',
    hot: false,
  },
];

export default function DjDiscovery() {
  return (
    <section id="djs" className="relative py-28 sm:py-36">
      <div className="container-xl">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 items-center">
          {/* Left — card stack */}
          <div className="relative h-[520px]">
            <div className="absolute inset-0 bg-radial-neon opacity-60 pointer-events-none" />
            {djs.map((dj, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                style={{
                  top: `${i * 56}px`,
                  left: `${i * 28}px`,
                  zIndex: djs.length - i,
                  opacity: 1 - i * 0.18,
                }}
                className="absolute right-0 max-w-[360px] rounded-[22px] glass p-5 hover:-translate-y-1 transition-transform"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${dj.color} flex items-center justify-center font-display font-extrabold text-white text-[22px]`}
                    >
                      {dj.initial}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-display font-extrabold text-[18px] tracking-tight text-white">
                          {dj.name}
                        </div>
                        {dj.hot && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-crowd-packed/20 text-crowd-packed">
                            🔥 HOT
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] text-ink-mute">{dj.genre}</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-ink-mute flex items-center gap-1">
                    <span className="text-crowd-lively">★</span> {dj.rating}
                  </div>
                </div>

                {/* Gig bar */}
                <div className="rounded-xl bg-black/40 p-3 neon-border-faint">
                  <div className="text-[10px] uppercase tracking-wider text-ink-mute mb-1">
                    Next gig
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-white text-[14px]">{dj.venue}</div>
                    <div className="text-[11px] text-neon-bright">{dj.time}</div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button className="flex-1 rounded-full bg-neon/15 text-neon-bright text-[12px] font-semibold py-2 hover:bg-neon/25 transition">
                    + Follow
                  </button>
                  <button className="rounded-full glass px-4 text-[12px] font-semibold text-white/80 border border-white/10">
                    Set reminder
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right text */}
          <div>
            <div className="eyebrow mb-5">DJ Profiles</div>
            <h2 className="section-title">
              Know where they're<br />
              <span className="text-neon">playing</span> tonight.
            </h2>
            <p className="section-kicker mt-6">
              Every DJ in KL, auto-profiled from their gigs. Follow the ones you
              love. Get pinged the moment they're booked. Never miss a set from
              your favourite act again.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                'Search by name, genre, or venue',
                'Full upcoming calendar across every bar',
                'Rate sets you actually attended',
                '"Who\'s Hot This Week" ranked by crowd',
              ].map((t, i) => (
                <li key={i} className="flex items-center gap-3 text-[14.5px] text-white/85">
                  <div className="w-5 h-5 rounded-full bg-neon/20 flex items-center justify-center text-neon text-[11px]">
                    ✓
                  </div>
                  {t}
                </li>
              ))}
            </ul>

            {/* Genre pills */}
            <div className="mt-9 flex flex-wrap gap-2">
              {['House', 'Techno', 'Hip-Hop', 'R&B', 'Afrobeats', 'EDM', 'Live Jazz', 'Acoustic'].map((g) => (
                <span
                  key={g}
                  className="text-[12px] font-semibold px-3.5 py-1.5 rounded-full glass border border-white/8 text-white/80 hover:text-neon-bright hover:border-neon/40 transition cursor-default"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
