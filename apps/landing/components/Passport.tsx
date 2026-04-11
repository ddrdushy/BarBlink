'use client';

import { motion } from 'framer-motion';

const pins = [
  { x: 18, y: 28, area: 'Mont Kiara' },
  { x: 34, y: 55, area: 'Bangsar' },
  { x: 52, y: 40, area: 'KLCC' },
  { x: 58, y: 62, area: 'Bukit Bintang' },
  { x: 48, y: 78, area: 'Chinatown' },
  { x: 70, y: 30, area: 'Desa ParkCity' },
  { x: 74, y: 65, area: 'TREC' },
  { x: 26, y: 72, area: 'Mid Valley' },
];

const badges = [
  { emoji: '🦉', label: 'Night Owl', sub: '30-night streak' },
  { emoji: '🏆', label: 'Verified Regular', sub: '50 visits · Zouk KL' },
  { emoji: '🗺️', label: 'KL Explorer', sub: '23 venues visited' },
  { emoji: '🥂', label: 'Curator', sub: '4 collections shared' },
];

export default function Passport() {
  return (
    <section className="relative py-28 sm:py-36 overflow-hidden">
      <div className="container-xl">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-16 items-center">
          {/* Left text */}
          <div>
            <div className="eyebrow mb-5">Nightlife Passport</div>
            <h2 className="section-title">
              Your city,<br />
              <span className="text-neon">pinned</span>.
            </h2>
            <p className="section-kicker mt-6">
              Every bar you visit gets pinned on your personal KL map. Build
              your scene. Earn badges. Unlock Verified Regular status at your
              home bar. Share your collection — this is your story of the city
              after dark.
            </p>

            <div className="mt-9 grid grid-cols-2 gap-3">
              {badges.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="rounded-2xl p-4 glass flex items-center gap-3"
                  style={{ borderColor: 'rgba(196,90,255,0.14)' }}
                >
                  <div className="w-11 h-11 rounded-xl bg-neon/12 flex items-center justify-center text-[20px]">
                    {b.emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white text-[13.5px] truncate">{b.label}</div>
                    <div className="text-[11px] text-ink-mute truncate">{b.sub}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right — map */}
          <div className="relative">
            <div className="absolute -inset-10 bg-radial-neon opacity-60 pointer-events-none" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/3] rounded-[28px] overflow-hidden glass shadow-glow-lg"
            >
              {/* Map bg */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at center, #1a1528 0%, #0a0a10 70%)',
                }}
              />
              <div className="absolute inset-0 dots-bg opacity-60" />

              {/* Faux streets */}
              <svg className="absolute inset-0 w-full h-full opacity-25" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,40 Q30,30 55,45 T100,50" stroke="#C45AFF" strokeWidth="0.3" fill="none" />
                <path d="M0,65 Q25,70 50,60 T100,70" stroke="#C45AFF" strokeWidth="0.3" fill="none" />
                <path d="M20,0 Q30,30 25,50 T30,100" stroke="#C45AFF" strokeWidth="0.3" fill="none" />
                <path d="M65,0 Q60,30 70,50 T65,100" stroke="#C45AFF" strokeWidth="0.3" fill="none" />
              </svg>

              {/* Pins */}
              {pins.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                  className="absolute"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  <div className="relative -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 rounded-full bg-neon" style={{ boxShadow: '0 0 16px #C45AFF' }} />
                    <div className="absolute inset-0 rounded-full bg-neon/40 animate-pulse-ring" />
                  </div>
                </motion.div>
              ))}

              {/* Legend card */}
              <div className="absolute top-4 left-4 rounded-xl glass px-3 py-2 neon-border-faint">
                <div className="text-[10px] text-ink-mute uppercase tracking-wider">Your Map</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="font-display font-extrabold text-[22px] text-white leading-none">23</div>
                  <div className="text-[10px] text-ink-mute leading-tight">venues<br/>visited</div>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 rounded-xl glass px-3 py-2 neon-border-faint">
                <div className="text-[10px] text-ink-mute uppercase tracking-wider">This week</div>
                <div className="text-[14px] font-semibold text-white">+3 new venues 🔥</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
