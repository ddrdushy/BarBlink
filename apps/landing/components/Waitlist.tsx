'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';

export default function Waitlist() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
    } catch {
      setStatus('error');
      setError("That didn't work — try again.");
    }
  };

  return (
    <section id="waitlist" className="relative py-28 sm:py-36 overflow-hidden">
      {/* Big radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(196,90,255,0.18) 0%, transparent 70%)',
        }}
      />
      <div className="container-xl relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="relative max-w-[720px] mx-auto rounded-[32px] p-8 sm:p-14 text-center overflow-hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(26,26,32,0.9) 0%, rgba(14,14,18,0.8) 100%)',
            border: '1px solid rgba(196, 90, 255, 0.32)',
            boxShadow: '0 40px 120px -20px rgba(196,90,255,0.25), 0 0 0 1px rgba(255,255,255,0.04) inset',
          }}
        >
          {/* Corner glow */}
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(196,90,255,0.35) 0%, transparent 60%)',
            }}
          />

          <div className="relative">
            <div className="eyebrow mb-4 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-live live-dot" />
              Early Access · Limited
            </div>

            <h2 className="font-display font-extrabold tracking-tightest text-white"
              style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4rem)', lineHeight: 0.95 }}
            >
              Be first in KL to<br />
              <span className="text-gradient-neon">Blink in.</span>
            </h2>

            <p className="mt-6 max-w-[460px] mx-auto text-ink-mute text-[15.5px] leading-relaxed">
              Join the waitlist. The second Barblink drops in Kuala Lumpur,
              you'll get a TestFlight invite and a download link — before
              anyone else.
            </p>

            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-10 rounded-2xl glass neon-border p-6 max-w-[480px] mx-auto"
              >
                <div className="text-[36px] mb-2">🦉</div>
                <div className="font-display font-bold text-white text-[22px] tracking-tight">
                  You're on the list.
                </div>
                <div className="text-ink-mute text-[14px] mt-1">
                  We'll let you know the moment Barblink drops in KL.
                </div>
              </motion.div>
            ) : (
              <form
                onSubmit={submit}
                className="mt-10 flex flex-col sm:flex-row gap-3 max-w-[520px] mx-auto"
              >
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  className="flex-1 px-5 py-4 rounded-full bg-black/40 border border-white/10 focus:border-neon/60 focus:outline-none text-white placeholder:text-ink-mute text-[14px] transition"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-neon disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Adding…' : 'Get Access →'}
                </button>
              </form>
            )}

            {error && <div className="mt-3 text-crowd-packed text-[12.5px]">{error}</div>}

            <div className="mt-6 text-[12px] text-ink-mute">
              No spam. Just your launch notification. 🦉
            </div>

            <div className="mt-10 pt-8 border-t border-white/6 flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-[12px] text-ink-mute">
                <div className="w-1.5 h-1.5 rounded-full bg-live" /> 2,841 joined
              </div>
              <div className="flex items-center gap-2 text-[12px] text-ink-mute">
                <span>🇲🇾</span> Launching in KL first
              </div>
              <div className="flex items-center gap-2 text-[12px] text-ink-mute">
                <span>🔒</span> 18+ gated
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
