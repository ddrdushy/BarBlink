'use client';

import { useEffect, useState } from 'react';
import { useDjAuth } from '@/components/DjAuthProvider';
import { djGet } from '@/lib/api';

interface RatingSummary {
  averageRating: number;
  totalRatings: number;
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;
}

interface Rating {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  venueName: string;
  createdAt: string;
}

export default function RatingsPage() {
  const { token } = useDjAuth();
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const s = await djGet<RatingSummary>('/dj/me/ratings/summary', token);
        setSummary(s);
        const r = await djGet<{ ratings: Rating[] }>('/dj/me/ratings', token);
        setRatings(r.ratings || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, [token]);

  const summaryCards = [
    { label: 'Average Rating', value: summary?.averageRating ? summary.averageRating.toFixed(1) : '-', color: 'text-amber' },
    { label: 'Total Ratings', value: summary?.totalRatings ?? '-', color: 'text-neon' },
    { label: '5-Star', value: summary?.fiveStars ?? '-', color: 'text-live' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Ratings</h1>
        <p className="text-ink-mute text-sm mt-1">See how your audience rates your performances</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-surface rounded-2xl border border-white/[0.06] p-5">
            <p className="text-ink-faint text-[11px] font-bold tracking-wider uppercase mb-2">{card.label}</p>
            <p className={`text-3xl font-extrabold ${card.color}`}>
              {loading ? '...' : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Ratings Table */}
      <div className="bg-surface rounded-2xl border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-ink-mute">Loading ratings...</div>
        ) : ratings.length === 0 ? (
          <div className="p-8 text-center text-ink-mute">No ratings yet</div>
        ) : (
          <table className="portal-table">
            <thead>
              <tr>
                <th>From</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Venue</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium">{r.userName}</td>
                  <td><span className="text-amber">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span></td>
                  <td className="text-ink-mute max-w-[250px] truncate">{r.comment || '-'}</td>
                  <td className="text-ink-mute">{r.venueName}</td>
                  <td className="text-ink-faint text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
