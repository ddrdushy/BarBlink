'use client';

import { motion } from 'framer-motion';
import ParticleCanvas from './ParticleCanvas';

const avatars = [
  { bg: 'from-[#C45AFF] to-[#7A2BBE]', initial: 'A' },
  { bg: 'from-[#FF6F91] to-[#C93D74]', initial: 'M' },
  { bg: 'from-[#2BC4FF] to-[#1E6BA8]', initial: 'K' },
  { bg: 'from-[#FFD166] to-[#E8A030]', initial: 'L' },
  { bg: 'from-[#4CD964] to-[#2E8B3D]', initial: 'J' },
];

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] pt-[110px] pb-24 flex items-center">
      {/* Canvas particles */}
      <div className="absolute inset-0 pointer-events-none">
        <ParticleCanvas />
      </div>
      {/* Grid fade */}
      <div className="absolute inset-0 grid-fade pointer-events-none" />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(196,90,255,0.18) 0%, rgba(13,13,15,0) 60%)',
        }}
      />

      <div className="container-xl relative z-10 w-full">
        <div className="flex flex-col items-center text-center">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass neon-border-faint mb-10"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-live opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-live" />
            </span>
            <span className="text-[12px] font-medium text-white/80 tracking-wide">
              Now launching in KL & Colombo <span className="ml-1">🇲🇾🇱🇰</span>
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-extrabold tracking-tightest text-white max-w-[1100px]"
            style={{ fontSize: 'clamp(2.75rem, 8vw, 7.5rem)', lineHeight: 0.92 }}
          >
            Your night starts with a{' '}
            <span className="relative inline-block">
              <span className="text-gradient-neon">Blink</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.1, delay: 0.8, ease: 'easeOut' }}
                className="absolute left-0 right-0 -bottom-1 h-[5px] rounded-full origin-left"
                style={{
                  background: 'linear-gradient(90deg, #C45AFF, #D97BFF, transparent)',
                  boxShadow: '0 0 24px rgba(196,90,255,0.75)',
                }}
              />
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-8 max-w-[640px] text-[17px] sm:text-[19px] text-ink-mute leading-relaxed font-light"
          >
            The nightlife social app for KL & Colombo. Discover where the vibe is real,
            follow your favourite DJs, and know exactly where your crew is —{' '}
            <span className="text-white/90">before</span> you leave the house.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row gap-3 items-center"
          >
            <a href="#waitlist" className="btn-neon">
              Get Early Access
              <span className="ml-1">→</span>
            </a>
            <a href="#features" className="btn-ghost">
              See how it works
            </a>
          </motion.div>

          {/* Social proof strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="mt-14 flex items-center gap-4"
          >
            <div className="flex -space-x-3">
              {avatars.map((a, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${a.bg} ring-2 ring-bg text-white font-semibold text-[13px] flex items-center justify-center`}
                >
                  {a.initial}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full bg-white/6 neon-border-faint ring-2 ring-bg text-neon-bright font-semibold text-[11px] flex items-center justify-center">
                +2k
              </div>
            </div>
            <div className="text-left">
              <div className="text-[14px] font-semibold text-white">2,841 on the waitlist</div>
              <div className="text-[12px] text-ink-mute">Blinking in before you do</div>
            </div>
          </motion.div>
        </div>

        {/* Metric cards row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-[920px] mx-auto"
        >
          {[
            { k: '50+', v: 'KL & Colombo venues', d: 'Bukit Bintang · KLCC · Fort' },
            { k: '120', v: 'DJs & live acts', d: 'Auto-updated nightly' },
            { k: '3s', v: 'To check in', d: 'One tap. No scanning.' },
            { k: '24/7', v: 'Live crowd meter', d: 'See packed vs. quiet' },
          ].map((m, i) => (
            <div
              key={i}
              className="rounded-2xl glass p-4 text-left hover:border-neon/40 transition"
              style={{ borderColor: 'rgba(196,90,255,0.12)' }}
            >
              <div className="font-display font-extrabold text-[28px] text-white leading-none">
                {m.k}
              </div>
              <div className="mt-1.5 text-[12.5px] font-medium text-white/80">{m.v}</div>
              <div className="text-[11px] text-ink-mute mt-0.5">{m.d}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <div className="mt-16 flex flex-col items-center gap-2">
          <div className="text-[10px] tracking-[0.3em] uppercase text-ink-mute">Scroll</div>
          <div className="w-px h-14 bg-gradient-to-b from-neon/70 to-transparent" />
        </div>
      </div>
    </section>
  );
}
