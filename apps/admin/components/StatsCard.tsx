export function StatsCard({ label, value, icon, accent }: {
  label: string;
  value: string | number;
  icon: string;
  accent?: string;
}) {
  return (
    <div className="bg-surface rounded-xl border border-white/[0.06] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold tracking-wider uppercase text-ink-mute">{label}</span>
        <span className="text-[20px]">{icon}</span>
      </div>
      <div className={`text-[32px] font-extrabold tracking-tight ${accent || 'text-ink'}`}>
        {value}
      </div>
    </div>
  );
}
