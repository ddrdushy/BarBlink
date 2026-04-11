'use client';

import { useEffect, useState } from 'react';
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
      setStats({
        totalUsers: u.totalUsers,
        totalVenues: v.totalVenues,
        totalPosts: s.totalPosts,
        postsToday: s.postsToday,
        checkinsToday: c.checkinsToday,
        activeNow: c.activeNow,
      });
    }).catch(() => {});
  }, [token]);

  const dau = stats?.activeNow || 0;
  const dauPercent = Math.min(100, Math.round((dau / 1000) * 100));

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">Dashboard</h1>
      <p className="text-ink-mute text-sm mb-8">Platform overview</p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total Users" value={stats?.totalUsers ?? '—'} icon="👥" />
        <StatsCard label="Total Venues" value={stats?.totalVenues ?? '—'} icon="🏪" />
        <StatsCard label="Check-ins Today" value={stats?.checkinsToday ?? '—'} icon="📍" accent="text-live" />
        <StatsCard label="Posts Today" value={stats?.postsToday ?? '—'} icon="📝" accent="text-neon-bright" />
      </div>

      {/* DAU Progress */}
      <div className="bg-surface rounded-xl border border-white/[0.06] p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold tracking-wider uppercase text-ink-mute">
            DAU Progress — 1,000 Target
          </span>
          <span className="text-neon-bright font-bold text-sm">{dau} / 1,000</span>
        </div>
        <div className="w-full h-3 bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon to-neon-bright rounded-full transition-all duration-500"
            style={{ width: `${dauPercent}%` }}
          />
        </div>
        <p className="text-ink-faint text-xs mt-2">
          {dauPercent < 100
            ? `${1000 - dau} more users to unlock Phase 2 (venue commerce)`
            : 'Target reached! Time to plan Phase 2.'}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface rounded-xl border border-white/[0.06] p-5">
          <span className="text-[11px] font-bold tracking-wider uppercase text-ink-mute">Active Now</span>
          <div className="text-[28px] font-extrabold text-live mt-2">{stats?.activeNow ?? 0}</div>
          <p className="text-ink-faint text-xs mt-1">Users currently checked in</p>
        </div>
        <div className="bg-surface rounded-xl border border-white/[0.06] p-5">
          <span className="text-[11px] font-bold tracking-wider uppercase text-ink-mute">Total Posts</span>
          <div className="text-[28px] font-extrabold text-neon-bright mt-2">{stats?.totalPosts ?? 0}</div>
          <p className="text-ink-faint text-xs mt-1">All-time content created</p>
        </div>
      </div>
    </div>
  );
}
