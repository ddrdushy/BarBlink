'use client';

import { motion } from 'framer-motion';

const chatLines = [
  { side: 'them', text: 'yo where we going tonight' },
  { side: 'them', text: 'someone pls decide' },
  { side: 'me', text: 'idk, Zouk? or we did that last week' },
  { side: 'them', text: 'is Kyo still packed at this hour?' },
  { side: 'them', text: 'heard Lui is playing somewhere' },
  { side: 'me', text: '... let me google' },
  { side: 'them', text: '😴' },
];

export default function FomoHook() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="container-xl">
        <div className="grid md:grid-cols-[1.1fr_1fr] gap-16 items-center">
          {/* Left — copy */}
          <div>
            <div className="eyebrow mb-5">The problem</div>
            <h2 className="section-title">
              The night doesn't start
              <br />
              in a <span className="text-neon">group chat</span> anymore.
            </h2>
            <p className="section-kicker mt-6">
              Every weekend, the same WhatsApp group. Same 40 messages. Nobody
              knows which bar is actually busy. Nobody knows if the DJ is any
              good. Someone's already halfway to the wrong venue.
            </p>

            <div className="mt-8 space-y-4">
              {[
                {
                  icon: '📍',
                  t: 'You guess the vibe.',
                  d: 'Show up. Half empty. Taxi home. Night ruined.',
                },
                {
                  icon: '🎧',
                  t: 'You miss your DJ.',
                  d: "They played your favourite bar last night. You didn't know.",
                },
                {
                  icon: '👥',
                  t: 'You lose your crew.',
                  d: 'Three bars, two Ubers, and nobody is at the same place.',
                },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex items-start gap-4 rounded-2xl p-4 glass"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-neon/15 flex items-center justify-center text-[18px] shrink-0">
                    {p.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-[15px]">{p.t}</div>
                    <div className="text-ink-mute text-[13.5px] mt-0.5">{p.d}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="mt-10 font-display font-bold text-[22px] sm:text-[26px] tracking-tighter">
              Barblink fixes <span className="text-neon">all three</span>. Before you leave the house.
            </p>
          </div>

          {/* Right — chat mockup */}
          <div className="relative">
            <div className="absolute -inset-10 bg-radial-neon opacity-60 pointer-events-none" />
            <div className="relative rounded-[28px] glass p-5 sm:p-6 shadow-glow-lg">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF6F91] to-[#C93D74] ring-2 ring-bg-surface" />
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2BC4FF] to-[#1E6BA8] ring-2 ring-bg-surface" />
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FFD166] to-[#E8A030] ring-2 ring-bg-surface" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-white">The Squad 🥂</div>
                    <div className="text-[10.5px] text-ink-mute">friday night · 3 online</div>
                  </div>
                </div>
                <div className="text-[10px] uppercase tracking-wider text-ink-mute">WhatsApp</div>
              </div>

              <div className="space-y-2.5 max-h-[420px] overflow-hidden">
                {chatLines.map((l, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className={`flex ${l.side === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-3.5 py-2 text-[13.5px] rounded-2xl ${
                        l.side === 'me'
                          ? 'bg-neon/20 text-white rounded-br-md'
                          : 'bg-white/6 text-white/85 rounded-bl-md'
                      }`}
                    >
                      {l.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Divider */}
              <div className="my-5 divider-neon" />

              {/* Swap card */}
              <div className="rounded-2xl neon-border bg-neon-ghost p-4">
                <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-neon-bright">
                  Or, open Barblink
                </div>
                <div className="mt-2 font-display font-bold text-white text-[18px] leading-tight">
                  Kyo Bar is 🔴 Packed. LI Brothers spinning.
                </div>
                <div className="text-ink-mute text-[12.5px] mt-1.5">
                  Marcus, Aina and Kenji are already there. Tap to join.
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 glass neon-border rounded-full px-3 py-1.5 text-[11px] font-semibold text-white"
            >
              ✦ 3 friends active
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-2 -left-3 glass neon-border rounded-full px-3 py-1.5 text-[11px] font-semibold text-white"
            >
              🎧 KYRA · 11pm
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
