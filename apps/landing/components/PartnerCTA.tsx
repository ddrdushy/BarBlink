'use client';

import { motion } from 'framer-motion';

export default function PartnerCTA() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="eyebrow mb-4 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-neon" />
            For Venues & DJs
          </div>
          <h2
            className="font-display font-extrabold tracking-tightest text-white"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', lineHeight: 1 }}
          >
            Join the Barblink platform
          </h2>
          <p className="mt-4 text-ink-mute text-[15px] max-w-[500px] mx-auto">
            Get your venue or DJ profile on Barblink. Reach KL and Colombo&apos;s nightlife crowd directly.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5 max-w-[800px] mx-auto">
          {/* Venue CTA */}
          <motion.a
            href="https://venue.barblink.com/register"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group relative rounded-[24px] p-8 text-left overflow-hidden transition hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, rgba(26,26,32,0.9) 0%, rgba(14,14,18,0.8) 100%)',
              border: '1px solid rgba(196, 90, 255, 0.2)',
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-neon/10 blur-3xl" />
            <span className="text-[36px] mb-4 block">🏛️</span>
            <h3 className="font-display font-bold text-white text-[20px] tracking-tight">
              Register Your Venue
            </h3>
            <p className="mt-2 text-ink-mute text-[13.5px] leading-relaxed">
              List your bar, club, or lounge on Barblink. Get discovered by thousands of nightlife enthusiasts.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-neon-bright text-[13px] font-semibold group-hover:gap-3 transition-all">
              Get started <span>→</span>
            </div>
          </motion.a>

          {/* DJ CTA */}
          <motion.a
            href="https://dj.barblink.com/register"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative rounded-[24px] p-8 text-left overflow-hidden transition hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, rgba(26,26,32,0.9) 0%, rgba(14,14,18,0.8) 100%)',
              border: '1px solid rgba(196, 90, 255, 0.2)',
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-neon/10 blur-3xl" />
            <span className="text-[36px] mb-4 block">🎧</span>
            <h3 className="font-display font-bold text-white text-[20px] tracking-tight">
              DJ / Band Registration
            </h3>
            <p className="mt-2 text-ink-mute text-[13.5px] leading-relaxed">
              Claim your profile or create a new one. Manage gigs, connect with venues, build your following.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-neon-bright text-[13px] font-semibold group-hover:gap-3 transition-all">
              Join as DJ <span>→</span>
            </div>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
