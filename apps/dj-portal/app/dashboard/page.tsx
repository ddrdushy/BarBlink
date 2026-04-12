'use client';

import { useEffect, useState } from 'react';
import { useDjAuth } from '@/components/DjAuthProvider';
import { djGet } from '@/lib/api';

interface DjStats {
  followers: number;
  totalGigs: number;
  averageRating: number;
  upcomingEvents: number;
}

interface RecentRating {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  venueName: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { token } = useDjAuth();
  const [djName, setDjName] = useState('');
  const [stats, setStats] = useState<DjStats | null>(null);
  const [ratings, setRatings] = useState<RecentRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const profile = await djGet<{ stageName: string }>('/dj/me', token);
        setDjName(profile.stageName);
        const s = await djGet<DjStats>('/dj/me/stats', token);
        setStats(s);
        const r = await djGet<{ ratings: RecentRating[] }>('/dj/me/ratings?limit=5', token);
        setRatings(r.ratings || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, [token]);

  const storedName = typeof window !== 'undefined' ? localStorage.getItem('bbk_dj_name') : null;

  const statCards = [
    { label: 'Followers', value: stats?.followers ?? '-', color: 'text-neon' },
    { label: 'Gigs', value: stats?.totalGigs ?? '-', color: 'text-amber' },
    { label: 'Rating', value: stats?.averageRating ? stats.averageRating.toFixed(1) : '-', color: 'text-live' },
    { label: 'Upcoming Events', value: stats?.upcomingEvents ?? '-', color: 'text-neon-bright' },
  ];

  return (
    <div>
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon to-neon-dim flex items-center justify-center text-2xl">
            🎵
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {djName || storedName || 'Dashboard'}
            </h1>
            <p className="text-ink-mute text-sm">Welcome to your DJ portal</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-surface rounded-2xl border border-white/[0.06] p-5">
            <p className="text-ink-faint text-[11px] font-bold tracking-wider uppercase mb-2">{card.label}</p>
            <p className={`text-3xl font-extrabold ${card.color}`}>
              {loading ? '...' : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Ratings */}
      <h2 className="text-lg font-bold mb-4">Recent Ratings</h2>
      <div className="bg-surface rounded-2xl border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-ink-mute">Loading...</div>
        ) : ratings.length === 0 ? (
          <div className="p-8 text-center text-ink-mute">No ratings yet</div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {ratings.map((r) => (
              <div key={r.id} className="p-4 hover:bg-white/[0.02] transition">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{r.userName}</span>
                  <span className="text-amber text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                {r.comment && <p className="text-ink-mute text-xs mb-1">{r.comment}</p>}
                <p className="text-ink-faint text-[11px]">{r.venueName} &middot; {new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
