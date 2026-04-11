'use client';

import { motion } from 'framer-motion';

const venues = [
  { name: 'Zouk KL', area: 'TREC', level: 92, status: 'packed', friends: 4 },
  { name: 'Kyo Bar', area: 'Changkat', level: 78, status: 'packed', friends: 2 },
  { name: 'PS150', area: 'Chinatown', level: 54, status: 'lively', friends: 1 },
  { name: 'Heli Lounge', area: 'Menara KH', level: 46, status: 'lively', friends: 0 },
  { name: 'Three X Co', area: 'Bukit Damansara', level: 22, status: 'quiet', friends: 0 },
];

const statusConfig: Record<string, { color: string; label: string }> = {
  packed: { color: '#FF453A', label: 'Packed' },
  lively: { color: '#FFD60A', label: 'Getting Lively' },
  quiet: { color: '#32D74B', label: 'Quiet' },
};

export default function CrowdMeterDemo() {
  return (
    <section className="relative py-28 sm:py-36 bg-bg-deep/30 border-y border-white/[0.04]">
      <div className="container-xl">
        <div className="text-center max-w-[720px] mx-auto mb-14">
          <div className="eyebrow mb-4">Crowd Meter</div>
          <h2 className="section-title">
            Don't guess.<br />
            <span className="text-neon">See</span> it.
          </h2>
          <p className="section-kicker mt-6 mx-auto">
            Barblink turns every check-in into a real-time vibe signal. Know
            which bar is going off and which one is dead — before you order
            your ride.
          </p>
        </div>

        <div className="max-w-[880px] mx-auto rounded-[28px] glass p-6 sm:p-8 shadow-glow-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-ink-mute">Live crowd in</div>
              <div className="font-display font-extrabold text-white text-[22px] tracking-tighter">Kuala Lumpur</div>
            </div>
            <div className="flex items-center gap-2 rounded-full glass px-3 py-1.5 neon-border-faint">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-live opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-live" />
              </span>
              <span className="text-[11px] font-semibold text-white/80">Updating · just now</span>
            </div>
          </div>

          {/* Rows */}
          <div className="space-y-3">
            {venues.map((v, i) => {
              const s = statusConfig[v.status];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="rounded-2xl p-4 flex items-center gap-4 hover:bg-white/[0.02] transition"
                  style={{
                    background: 'rgba(255,255,255,0.015)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `${s.color}18`,
                      border: `1px solid ${s.color}40`,
                    }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-display font-bold text-white text-[16px] tracking-tight truncate">
                        {v.name}
                      </div>
                      {v.friends > 0 && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-neon/15 text-neon-bright shrink-0">
                          {v.friends} friend{v.friends > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="text-[11.5px] text-ink-mute">{v.area}</div>
                    {/* Bar */}
                    <div className="mt-2 h-1.5 rounded-full bg-white/6 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${v.level}%` }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${s.color}80, ${s.color})`,
                          boxShadow: `0 0 12px ${s.color}80`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display font-bold text-white text-[17px] leading-none">{v.level}%</div>
                    <div className="text-[10px] font-semibold mt-1" style={{ color: s.color }}>
                      {s.label}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between text-[11.5px] text-ink-mute">
            <span>Based on active check-ins in the last 3 hours.</span>
            <span>Powered by real humans. Not algorithms.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
