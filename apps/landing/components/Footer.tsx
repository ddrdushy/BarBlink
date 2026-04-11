export default function Footer() {
  return (
    <footer className="relative pt-20 pb-10 border-t border-white/[0.06]">
      <div className="container-xl">
        <div className="grid md:grid-cols-[1.2fr_1fr_1fr_1fr] gap-10 pb-14">
          <div>
            <a href="#" className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon to-[#7A2BBE] flex items-center justify-center text-[16px]">
                🦉
              </div>
              <span className="font-display font-extrabold text-[19px] tracking-tighter">
                BAR<span className="text-neon">LINK</span>
              </span>
            </a>
            <p className="text-ink-mute text-[13.5px] leading-relaxed max-w-[280px]">
              The nightlife social app for KL, Colombo & beyond. Blink, you're in.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[
                { l: 'IG', t: 'Instagram' },
                { l: 'TT', t: 'TikTok' },
                { l: 'X', t: 'X / Twitter' },
              ].map((s) => (
                <a
                  key={s.l}
                  href="#"
                  aria-label={s.t}
                  className="w-9 h-9 rounded-full glass flex items-center justify-center text-[11px] font-semibold text-ink-mute hover:text-white hover:border-neon/40 transition"
                >
                  {s.l}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-ink-mute mb-4">Product</div>
            <ul className="space-y-2.5 text-[13.5px]">
              <li><a href="#features" className="text-white/80 hover:text-neon-bright transition">Features</a></li>
              <li><a href="#djs" className="text-white/80 hover:text-neon-bright transition">DJ Discovery</a></li>
              <li><a href="#feed" className="text-white/80 hover:text-neon-bright transition">Blink Feed</a></li>
              <li><a href="#waitlist" className="text-white/80 hover:text-neon-bright transition">Early Access</a></li>
            </ul>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-ink-mute mb-4">Company</div>
            <ul className="space-y-2.5 text-[13.5px]">
              <li><a href="#" className="text-white/80 hover:text-neon-bright transition">About</a></li>
              <li><a href="#" className="text-white/80 hover:text-neon-bright transition">For Venues</a></li>
              <li><a href="mailto:hello@barblink.com" className="text-white/80 hover:text-neon-bright transition">Contact</a></li>
              <li><a href="#" className="text-white/80 hover:text-neon-bright transition">Press Kit</a></li>
            </ul>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-ink-mute mb-4">Legal</div>
            <ul className="space-y-2.5 text-[13.5px]">
              <li><a href="/privacy" className="text-white/80 hover:text-neon-bright transition">Privacy Policy</a></li>
              <li><a href="/terms" className="text-white/80 hover:text-neon-bright transition">Terms of Service</a></li>
              <li><a href="/cookies" className="text-white/80 hover:text-neon-bright transition">Cookies</a></li>
              <li><a href="/community" className="text-white/80 hover:text-neon-bright transition">Community Rules</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-ink-mute">
          <div>© 2026 Barblink · 18+ only</div>
          <div className="flex items-center gap-2">
            Made for Asia's nightlife <span>🇲🇾🇱🇰</span>
          </div>
        </div>

        {/* Massive faded wordmark */}
        <div
          className="mt-16 text-center font-display font-extrabold tracking-tightest select-none pointer-events-none"
          style={{
            fontSize: 'clamp(4rem, 16vw, 14rem)',
            lineHeight: 0.85,
            background: 'linear-gradient(180deg, rgba(196,90,255,0.14) 0%, rgba(196,90,255,0) 70%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          BARBLINK
        </div>
      </div>
    </footer>
  );
}
