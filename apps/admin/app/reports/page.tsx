'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAdminAuth } from '@/components/AdminAuthProvider';
import { StatsCard } from '@/components/StatsCard';
import { socialGet, socialPut } from '@/lib/api';

type FilterTab = 'All' | 'Pending' | 'Actioned';

interface Report {
  id: string;
  reporterId: string;
  contentType: string;
  contentId: string;
  reason: string;
  status: string;
  actionTaken: string | null;
  actionedBy: string | null;
  createdAt: string;
}

interface ReportsResponse {
  items: Report[];
  total: number;
  page: number;
  totalPages: number;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  actioned: 'bg-live/20 text-live',
};

export default function ReportsPage() {
  const { token } = useAdminAuth();
  const [filter, setFilter] = useState<FilterTab>('All');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const statusParam = filter === 'Pending' ? '?status=pending' : filter === 'Actioned' ? '?status=actioned' : '';
      const data = await socialGet<ReportsResponse>(`/admin/reports${statusParam}`, token);
      setReports(data.items);
    } catch {
      setReports([]);
    }
    setLoading(false);
  }, [token, filter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleReview = async (reportId: string) => {
    if (!token) return;
    try {
      await socialPut<Report>(`/admin/reports/${reportId}`, { actionTaken: 'reviewed' }, token);
      // Update local state
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, status: 'actioned', actionTaken: 'reviewed' } : r,
        ),
      );
    } catch {
      /* silent */
    }
  };

  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const actionedToday = reports.filter(
    (r) => r.status === 'actioned' && new Date(r.createdAt).toDateString() === new Date().toDateString(),
  ).length;

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">Reports Queue</h1>
      <p className="text-ink-mute text-sm mb-6">Content moderation and user reports</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatsCard
          label="Pending"
          value={pendingCount}
          icon="🚨"
          accent={pendingCount > 0 ? 'text-danger' : 'text-ink'}
        />
        <StatsCard label="Actioned Today" value={actionedToday} icon="✅" accent="text-live" />
        <StatsCard label="Total Reports" value={reports.length} icon="📋" accent="text-neon-bright" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4">
        {(['All', 'Pending', 'Actioned'] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === tab
                ? 'bg-neon text-white'
                : 'bg-surface text-ink-mute hover:text-ink'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Content ID</th>
              <th>Reporter</th>
              <th>Reason</th>
              <th>Date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>
                  <span className="text-xs font-bold px-2 py-1 rounded-md bg-white/5 text-ink-mute">
                    {r.contentType}
                  </span>
                </td>
                <td className="max-w-[200px] truncate text-sm font-mono text-ink-mute">
                  {r.contentId.slice(0, 8)}...
                </td>
                <td className="text-ink-mute text-sm font-mono">{r.reporterId.slice(0, 8)}...</td>
                <td className="text-ink-mute text-sm">{r.reason}</td>
                <td className="text-ink-mute text-sm">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${STATUS_STYLES[r.status] || 'bg-white/5 text-ink-mute'}`}>
                    {r.status}
                  </span>
                </td>
                <td>
                  {r.status === 'pending' && (
                    <button
                      onClick={() => handleReview(r.id)}
                      className="text-neon-bright text-xs font-semibold hover:underline"
                    >
                      Review
                    </button>
                  )}
                  {r.status === 'actioned' && r.actionTaken && (
                    <span className="text-xs text-ink-faint">{r.actionTaken}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && reports.length === 0 && (
          <div className="py-12 text-center text-ink-faint text-sm">No reports yet</div>
        )}
        {loading && (
          <div className="py-12 text-center text-ink-faint text-sm">Loading...</div>
        )}
      </div>
    </div>
  );
}
