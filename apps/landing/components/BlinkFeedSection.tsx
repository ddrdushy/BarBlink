'use client';

import { motion } from 'framer-motion';

const stories = [
  { name: 'Aina', color: '#C45AFF', live: true },
  { name: 'Marc', color: '#FF6F91', live: true },
  { name: 'Kenji', color: '#2BC4FF', live: false },
  { name: 'Nasha', color: '#FFD166', live: true },
];

export default function BlinkFeedSection() {
  return (
    <section id="feed" className="relative py-28 sm:py-36 overflow-hidden">
      <div className="container-xl">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-16 items-center">
          {/* Left text */}
          <div>
            <div className="eyebrow mb-5">The Blink Feed</div>
            <h2 className="section-title">
              A feed built<br />
              for <span className="text-neon">nights out</span>.
            </h2>
            <p className="section-kicker mt-6">
              Not Instagram. Not TikTok. Not another scroll pit. The Blink Feed
              is a purpose-built social feed for nightlife — check-ins, crowd
              meters, stories, and crew tracking in one scroll. No politics. No
              rage bait. Just the scene.
            </p>

            <ul className="mt-10 space-y-4">
              {[
                { t: 'Hero posts', d: 'Cinematic full-width photos of your crew tonight' },
                { t: 'Check-in cards', d: 'Compact status cards — see who is where in one glance' },
                { t: 'Stories', d: '24-hour moments with neon rings and live dots' },
                { t: 'Drink ratings', d: 'Rate the cocktail. Build the collection. Be the friend who knows.' },
              ].map((x, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-neon/20 flex items-center justify-center text-neon text-[11px] shrink-0">✓</div>
                  <div>
                    <div className="text-white font-semibold text-[15px]">{x.t}</div>
                    <div className="text-ink-mute text-[13.5px]">{x.d}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex gap-3">
              <a href="#waitlist" className="btn-neon">Join the waitlist</a>
            </div>
          </div>

          {/* Right — phone mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div
              className="absolute -inset-20 bg-radial-neon opacity-80 pointer-events-none"
            />

            <motion.div
              initial={{ opacity: 0, y: 40, rotateY: -8 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="relative"
              style={{ perspective: 1200 }}
            >
              <div className="phone-frame">
                <div className="phone-notch" />
                <div className="phone-screen p-4 pt-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="font-display font-extrabold text-[16px] tracking-tighter">
                      blink<span className="text-neon">.</span>feed
                    </div>
                    <div className="flex items-center gap-3 text-ink-mute">
                      <div className="w-6 h-6 rounded-full glass flex items-center justify-center text-[10px]">🔔</div>
                      <div className="w-6 h-6 rounded-full glass flex items-center justify-center text-[10px]">💬</div>
                    </div>
                  </div>

                  {/* Stories strip */}
                  <div className="flex gap-3 mb-4 overflow-hidden">
                    {stories.map((s, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                        <div className="relative">
                          <div
                            className="w-[52px] h-[52px] rounded-full p-[2.5px]"
                            style={{
                              background: 'conic-gradient(from 0deg, #C45AFF, #D97BFF, #7A2BBE, #C45AFF)',
                            }}
                          >
                            <div
                              className="w-full h-full rounded-full"
                              style={{ background: s.color, border: '2px solid #0d0d0f' }}
                            />
                          </div>
                          {s.live && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-live ring-2 ring-bg" />
                          )}
                        </div>
                        <div className="text-[9px] text-white/80">{s.name}</div>
                      </div>
                    ))}
                  </div>

                  {/* Hero post */}
                  <div className="rounded-2xl overflow-hidden mb-3 relative h-[170px]"
                    style={{
                      background: 'linear-gradient(135deg, #C45AFF 0%, #7A2BBE 40%, #1a1a20 100%)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur text-[9px] font-semibold flex items-center gap-1">
                      📍 <span>Zouk KL</span>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-5 h-5 rounded-full bg-[#FF6F91]" />
                        <div className="text-[10px] font-semibold text-white">marcus.kl</div>
                        <div className="text-[9px] text-white/60">· 12m</div>
                      </div>
                      <div className="text-[10.5px] text-white/90 leading-tight">
                        Packed house tonight 🔥 KYRA is going off
                      </div>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 flex flex-col gap-1.5 text-white/90 text-[9px]">
                      <div>❤️ 312</div>
                      <div>💬 24</div>
                    </div>
                  </div>

                  {/* Check-in cards row */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Aina', venue: 'Kyo Bar', color: '#FF453A', status: 'Packed' },
                      { name: 'Kenji', venue: 'PS150', color: '#FFD60A', status: 'Lively' },
                    ].map((c, i) => (
                      <div key={i} className="rounded-xl p-2.5"
                        style={{
                          background: '#141418',
                          border: '1px solid rgba(196,90,255,0.25)',
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-neon to-[#7A2BBE]" />
                          <div className="text-[9px] text-ink-mute">{c.name} is at</div>
                        </div>
                        <div className="font-display font-bold text-[11.5px] text-neon leading-tight">{c.venue}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
                          <div className="text-[9px]" style={{ color: c.color }}>{c.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Drink rating card */}
                  <div className="mt-3 rounded-xl p-3 flex items-center gap-3"
                    style={{ background: '#141418', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber to-[#C97A10] flex items-center justify-center text-[16px]">🍸</div>
                    <div className="flex-1">
                      <div className="text-[10px] text-ink-mute">Old Fashioned · PS150</div>
                      <div className="text-[11px] text-white font-semibold">⭐⭐⭐⭐⭐ Perfect pour</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating sticker */}
              <motion.div
                animate={{ y: [0, -14, 0], rotate: [-2, 2, -2] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute -left-8 top-20 glass neon-border rounded-2xl px-3 py-2"
              >
                <div className="text-[10px] text-ink-mute">Checked in</div>
                <div className="font-display font-bold text-[14px]">Zouk KL 🔴</div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 7, repeat: Infinity, delay: 1.5 }}
                className="absolute -right-6 bottom-28 glass neon-border rounded-2xl px-3 py-2"
              >
                <div className="text-[10px] text-ink-mute">Now playing</div>
                <div className="font-display font-bold text-[14px]">🎧 KYRA</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
