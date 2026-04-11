'use client';

import { motion } from 'framer-motion';

const voices = [
  {
    quote: 'Finally. I no longer show up at a dead bar at 11pm on a Saturday. Barblink told me Zouk was packed — we rerouted in the Grab.',
    name: 'Aina R.',
    role: 'Designer · Bangsar',
    avatar: 'from-[#C45AFF] to-[#7A2BBE]',
  },
  {
    quote: "I follow three DJs and now I never miss a set. I get notified the second they're booked. It's unreal.",
    name: 'Marcus L.',
    role: 'Architect · Mont Kiara',
    avatar: 'from-[#FF6F91] to-[#C93D74]',
  },
  {
    quote: 'The crew tracking is the real unlock. We used to lose each other across three bars. Not anymore.',
    name: 'Nasha K.',
    role: 'Strategy · KLCC',
    avatar: 'from-[#FFD166] to-[#E8A030]',
  },
  {
    quote: 'I became a Verified Regular at my local. The bartender literally knows me from Barblink now. 🦉',
    name: 'Kenji T.',
    role: 'Founder · Hartamas',
    avatar: 'from-[#2BC4FF] to-[#1E6BA8]',
  },
];

export default function Voices() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="container-xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <div className="eyebrow mb-4">Voices from KL</div>
            <h2 className="section-title">
              Not just an app.<br />
              A <span className="text-neon">movement</span>.
            </h2>
          </div>
          <p className="section-kicker md:text-right md:max-w-[440px]">
            Early testers from Bangsar to Bukit Bintang. Real people, real
            nights, real opinions. Here's what they said.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {voices.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: (i % 2) * 0.1 }}
              className="relative rounded-[22px] p-7 sm:p-8 overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, rgba(26,26,32,0.85), rgba(14,14,18,0.6))',
                border: '1px solid rgba(196, 90, 255, 0.14)',
              }}
            >
              {/* Big quote mark */}
              <div className="absolute top-4 right-5 font-display text-[120px] leading-none text-neon/15 select-none pointer-events-none">
                "
              </div>
              <div className="relative">
                <div className="flex gap-0.5 mb-4 text-crowd-lively text-[13px]">
                  ★★★★★
                </div>
                <p className="text-white/90 text-[16px] leading-relaxed font-light">
                  "{v.quote}"
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${v.avatar} ring-2 ring-bg`} />
                  <div>
                    <div className="font-semibold text-white text-[14px]">{v.name}</div>
                    <div className="text-ink-mute text-[12px]">{v.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
