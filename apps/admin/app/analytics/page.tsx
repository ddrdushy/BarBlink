'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/components/AdminAuthProvider';
import { StatsCard } from '@/components/StatsCard';
import { userGet, venueGet, socialGet, checkinGet } from '@/lib/api';
import { format, subDays } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Venue {
  id: string;
  name: string;
  checkinCount?: number;
}

interface VenueList {
  items: Venue[];
  total: number;
}

interface PlatformStats {
  totalUsers: number;
  totalPosts: number;
  checkinsToday: number;
  activeNow: number;
}

// Generate placeholder chart data for last 30 days
// (will be replaced by real historical data once collection begins)
const chartData = Array.from({ length: 30 }, (_, i) => {
  const date = subDays(new Date(), 29 - i);
  return {
    date: format(date, 'MMM d'),
    dau: Math.floor(Math.random() * 50) + 5,
    posts: Math.floor(Math.random() * 20) + 1,
    checkins: Math.floor(Math.random() * 30) + 2,
  };
});

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1C1C22] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-ink-mute mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { token } = useAdminAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    if (!token) return;

    // Fetch real stats from all services (same endpoints as dashboard)
    Promise.all([
      userGet<{ totalUsers: number }>('/admin/stats', token),
      socialGet<{ totalPosts: number; postsToday: number }>('/admin/stats', token),
      checkinGet<{ checkinsToday: number; activeNow: number }>('/admin/stats', token),
    ])
      .then(([u, s, c]) => {
        setStats({
          totalUsers: u.totalUsers,
          totalPosts: s.totalPosts,
          checkinsToday: c.checkinsToday,
          activeNow: c.activeNow,
        });
      })
      .catch(() => {});

    // Fetch top venues
    venueGet<VenueList>('/admin/venues?limit=100', token)
      .then((d) => {
        const sorted = [...d.items].sort((a, b) => (b.checkinCount ?? 0) - (a.checkinCount ?? 0));
        setVenues(sorted.slice(0, 10));
      })
      .catch(() => {});
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">Analytics</h1>
      <p className="text-ink-mute text-sm mb-6">Platform metrics and engagement data</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatsCard label="Total Users" value={stats?.totalUsers ?? '—'} icon="👥" accent="text-neon-bright" />
        <StatsCard label="Total Posts" value={stats?.totalPosts ?? '—'} icon="📝" accent="text-live" />
        <StatsCard label="Check-ins Today" value={stats?.checkinsToday ?? '—'} icon="📍" accent="text-neon-bright" />
      </div>

      {/* Historical data notice */}
      <div className="mb-6 px-4 py-3 rounded-lg bg-surface border border-white/[0.06] text-ink-mute text-xs">
        Historical data collection starts after first 7 days. Charts below show placeholder trends.
      </div>

      {/* User Growth Chart */}
      <div className="bg-surface rounded-xl border border-white/[0.06] p-5 mb-6">
        <h2 className="text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-4">
          User Growth — Daily Active Users (30d)
        </h2>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#9A9AA8', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: '#9A9AA8', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="dau"
                name="DAU"
                stroke="#C45AFF"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#C45AFF' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Engagement Chart */}
      <div className="bg-surface rounded-xl border border-white/[0.06] p-5 mb-6">
        <h2 className="text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-4">
          Engagement — Posts & Check-ins per Day
        </h2>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#9A9AA8', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: '#9A9AA8', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="posts" name="Posts" fill="#C45AFF" radius={[3, 3, 0, 0]} />
              <Bar dataKey="checkins" name="Check-ins" fill="#32D74B" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Venues Table */}
      <div className="bg-surface rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-[11px] font-bold tracking-wider uppercase text-ink-mute">
            Top Venues by Check-ins
          </h2>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Venue</th>
              <th>Check-ins</th>
            </tr>
          </thead>
          <tbody>
            {venues.map((v, i) => (
              <tr key={v.id}>
                <td className="text-ink-mute text-sm font-mono w-10">{i + 1}</td>
                <td className="font-medium">{v.name}</td>
                <td className="text-ink-mute">{v.checkinCount ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {venues.length === 0 && (
          <div className="py-12 text-center text-ink-faint text-sm">No venue data available</div>
        )}
      </div>
    </div>
  );
}
