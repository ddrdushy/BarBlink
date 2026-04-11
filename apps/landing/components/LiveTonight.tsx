'use client';

const venues = [
  { name: 'Zouk KL', status: 'packed', djs: 'KYRA · Midnight Set' },
  { name: 'Kyo Bar', status: 'lively', djs: 'LI Brothers' },
  { name: 'Taps Beer Bar', status: 'quiet', djs: 'Saxman KL · Live Jazz' },
  { name: 'Pisco Bar', status: 'lively', djs: 'DJ Nadia' },
  { name: 'Heli Lounge', status: 'packed', djs: 'House Nights' },
  { name: 'Three X Co', status: 'lively', djs: 'Acoustic Session' },
  { name: 'Omakase + Appreciate', status: 'quiet', djs: 'No DJ' },
  { name: 'Fuego at Troika', status: 'packed', djs: 'Latin Fridays' },
  { name: 'PS150', status: 'lively', djs: 'Speakeasy Sounds' },
  { name: 'Coley', status: 'quiet', djs: 'Cocktail Bar' },
];

const statusMap: Record<string, { color: string; label: string }> = {
  packed: { color: '#FF453A', label: 'Packed' },
  lively: { color: '#FFD60A', label: 'Getting Lively' },
  quiet: { color: '#32D74B', label: 'Quiet' },
};

export default function LiveTonight() {
  const doubled = [...venues, ...venues];

  return (
    <section className="relative py-20 border-y border-white/[0.05] bg-bg-deep/40">
      <div className="container-xl">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="eyebrow mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-live live-dot" />
              Live from KL — right now
            </div>
            <h2 className="font-display font-bold text-[28px] sm:text-[36px] tracking-tighter">
              The city is <span className="text-neon">moving</span>.
            </h2>
          </div>
          <div className="text-ink-mute text-[13px] max-w-[320px]">
            A live look at where the vibe is tonight. Updated every minute from real check-ins.
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg to-transparent z-10" />
        <div className="marquee-track animate-marquee">
          {doubled.map((v, i) => {
            const s = statusMap[v.status];
            return (
              <div
                key={i}
                className="mx-3 flex items-center gap-3 rounded-full glass px-5 py-3 whitespace-nowrap"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: s.color,
                    boxShadow: `0 0 10px ${s.color}`,
                  }}
                />
                <span className="font-display font-bold text-[15px] text-white">{v.name}</span>
                <span className="text-ink-mute text-[12px]">· {v.djs}</span>
                <span className="text-[11px] font-semibold" style={{ color: s.color }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
