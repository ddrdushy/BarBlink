'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/components/AdminAuthProvider';
import { StatsCard } from '@/components/StatsCard';
import { userGet, venueGet, socialGet, checkinGet } from '@/lib/api';

interface Stats {
  totalUsers: number;
  totalVenues: number;
  totalPosts: number;
  postsToday: number;
  checkinsToday: number;
  activeNow: number;
}

const ACTIVITY_FEED = [
  { time: '2m ago', icon: '👤', text: 'New user registered: @nightowl_kl', color: 'text-neon-bright' },
  { time: '5m ago', icon: '📍', text: 'Check-in at Zouk KL (3 active)', color: 'text-live' },
  { time: '12m ago', icon: '📸', text: 'New post by @marcus_kl tagged at PS150', color: 'text-ink-mute' },
  { time: '18m ago', icon: '✅', text: 'Instagram scrape completed: Heli Lounge Bar', color: 'text-live' },
  { time: '25m ago', icon: '🎧', text: 'DJ profile auto-created: DJ Reza K', color: 'text-neon-bright' },
  { time: '32m ago', icon: '❌', text: 'Scraper failed: Elysium KL (retry scheduled)', color: 'text-danger' },
  { time: '45m ago', icon: '🚩', text: 'New content report submitted', color: 'text-amber' },
  { time: '1h ago', icon: '👤', text: 'New user registered: @colombo_vibes', color: 'text-neon-bright' },
];

export default function DashboardPage() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      userGet<{ totalUsers: number }>('/admin/stats', token),
      venueGet<{ totalVenues: number }>('/admin/stats', token),
      socialGet<{ totalPosts: number; postsToday: number }>('/admin/stats', token),
      checkinGet<{ checkinsToday: number; activeNow: number }>('/admin/stats', token),
    ]).then(([u, v, s, c]) => {
      setStats({ totalUsers: u.totalUsers, totalVenues: v.totalVenues, totalPosts: s.totalPosts, postsToday: s.postsToday, checkinsToday: c.checkinsToday, activeNow: c.activeNow });
    }).catch(() => {});
  }, [token]);

  const dau = stats?.activeNow || 0;
  const dauPercent = Math.min(100, Math.round((dau / 1000) * 100));

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">Dashboard</h1>
      <p className="text-ink-mute text-sm mb-6">Platform overview</p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            <StatsCard label="Total Users" value={stats?.totalUsers ?? '—'} icon="👥" />
            <StatsCard label="Total Venues" value={stats?.totalVenues ?? '—'} icon="🏛️" />
            <StatsCard label="Check-ins Today" value={stats?.checkinsToday ?? '—'} icon="📍" accent="text-live" />
            <StatsCard label="Posts Today" value={stats?.postsToday ?? '—'} icon="📸" accent="text-neon-bright" />
            <StatsCard label="Active Now" value={stats?.activeNow ?? 0} icon="🟢" accent="text-live" />
            <StatsCard label="Total Posts" value={stats?.totalPosts ?? 0} icon="📝" accent="text-neon-bright" />
          </div>

          <div className="bg-surface rounded-xl border border-white/[0.06] p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-wider uppercase text-ink-mute">DAU Progress — 1,000 Target</span>
              <span className="text-neon-bright font-bold text-sm">{dau} / 1,000</span>
            </div>
            <div className="w-full h-3 bg-elevated rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${dauPercent >= 100 ? 'bg-live' : 'bg-gradient-to-r from-neon to-neon-bright'}`} style={{ width: `${dauPercent}%` }} />
            </div>
            <p className="text-ink-faint text-xs mt-2">{dauPercent < 100 ? `${1000 - dau} more users to unlock Phase 2 (venue commerce)` : 'Phase 2 unlocked!'}</p>
          </div>

          <div className="bg-surface rounded-xl border border-white/[0.06] p-5">
            <h3 className="text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { href: '/venues', icon: '🏛️', label: 'Add Venue' },
                { href: '/reports', icon: '🚩', label: 'View Reports' },
                { href: '/waitlist', icon: '📧', label: 'Export Waitlist' },
                { href: '/scraper', icon: '🔄', label: 'Scraper Health' },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="flex items-center gap-2 px-4 py-3 rounded-lg bg-elevated border border-white/[0.04] hover:border-neon/30 transition text-sm font-medium text-ink-mute hover:text-ink">
                  <span>{a.icon}</span> {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-white/[0.06] p-5 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold tracking-wider uppercase text-ink-mute">Activity Feed</h3>
            <span className="w-2 h-2 rounded-full bg-live animate-pulse" />
          </div>
          <div className="space-y-3">
            {ACTIVITY_FEED.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-sm mt-0.5">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs ${item.color} leading-relaxed`}>{item.text}</p>
                  <p className="text-[10px] text-ink-faint mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
