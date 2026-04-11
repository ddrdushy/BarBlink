'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/components/AdminAuthProvider';
import { StatsCard } from '@/components/StatsCard';
import { checkinGet } from '@/lib/api';

interface Checkin {
  id: string;
  userId: string;
  venueId: string;
  checkedInAt: string;
  checkedOutAt: string | null;
  isActive: boolean;
}

interface CheckinList { items: Checkin[]; total: number; page: number; totalPages: number }
interface CheckinStats { checkinsToday: number; activeNow: number }

export default function CheckinsPage() {
  const { token } = useAdminAuth();
  const [data, setData] = useState<CheckinList | null>(null);
  const [stats, setStats] = useState<CheckinStats | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!token) return;
    checkinGet<CheckinList>(`/admin/checkins?page=${page}&limit=20`, token).then(setData).catch(() => {});
    checkinGet<CheckinStats>('/admin/stats', token).then(setStats).catch(() => {});
  }, [token, page]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">Check-ins</h1>
      <p className="text-ink-mute text-sm mb-6">{data?.total ?? 0} total check-ins</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatsCard label="Today" value={stats?.checkinsToday ?? 0} icon="📍" accent="text-neon-bright" />
        <StatsCard label="Active Now" value={stats?.activeNow ?? 0} icon="🟢" accent="text-live" />
      </div>

      <div className="bg-surface rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Venue ID</th>
              <th>Checked In</th>
              <th>Checked Out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((c) => (
              <tr key={c.id}>
                <td className="text-ink-mute text-xs font-mono">{c.userId.slice(0, 8)}...</td>
                <td className="text-ink-mute text-xs font-mono">{c.venueId.slice(0, 8)}...</td>
                <td className="text-ink-mute text-sm">{new Date(c.checkedInAt).toLocaleString()}</td>
                <td className="text-ink-mute text-sm">{c.checkedOutAt ? new Date(c.checkedOutAt).toLocaleString() : '—'}</td>
                <td>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${c.isActive ? 'bg-live/20 text-live' : 'bg-white/5 text-ink-faint'}`}>
                    {c.isActive ? 'active' : 'ended'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(data?.items || []).length === 0 && (
          <div className="py-12 text-center text-ink-faint text-sm">No check-ins yet</div>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex gap-2 mt-4 justify-center">
          {Array.from({ length: data.totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded-lg text-sm ${page === i + 1 ? 'bg-neon text-white' : 'bg-surface text-ink-mute hover:text-ink'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
