'use client';

import { useState } from 'react';
import { useAdminAuth } from '@/components/AdminAuthProvider';
import { StatsCard } from '@/components/StatsCard';

type ReportStatus = 'Pending' | 'Approved' | 'Removed' | 'Warned' | 'Suspended';
type ReportReason = 'Inappropriate' | 'Spam' | 'Harassment' | 'Underage';
type ReportType = 'Post' | 'Comment' | 'User';
type FilterTab = 'All' | 'Pending' | 'Actioned';

interface Report {
  id: string;
  type: ReportType;
  contentPreview: string;
  reportedBy: string;
  reason: ReportReason;
  date: string;
  status: ReportStatus;
}

// Empty for now — no reports backend yet
const REPORTS: Report[] = [];

const STATUS_STYLES: Record<ReportStatus, string> = {
  Pending: 'bg-yellow-500/20 text-yellow-400',
  Approved: 'bg-live/20 text-live',
  Removed: 'bg-danger/20 text-danger',
  Warned: 'bg-orange-500/20 text-orange-400',
  Suspended: 'bg-red-700/20 text-red-400',
};

export default function ReportsPage() {
  useAdminAuth();
  const [filter, setFilter] = useState<FilterTab>('All');

  const pendingCount = REPORTS.filter((r) => r.status === 'Pending').length;
  const actionedToday = REPORTS.filter(
    (r) => r.status !== 'Pending' && new Date(r.date).toDateString() === new Date().toDateString()
  ).length;

  const filtered = REPORTS.filter((r) => {
    if (filter === 'Pending') return r.status === 'Pending';
    if (filter === 'Actioned') return r.status !== 'Pending';
    return true;
  });

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
        <StatsCard label="Avg Response" value="--" icon="⏱️" accent="text-neon-bright" />
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
              <th>Content</th>
              <th>Reported By</th>
              <th>Reason</th>
              <th>Date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>
                  <span className="text-xs font-bold px-2 py-1 rounded-md bg-white/5 text-ink-mute">
                    {r.type}
                  </span>
                </td>
                <td className="max-w-[300px] truncate">{r.contentPreview.slice(0, 60)}</td>
                <td className="text-ink-mute text-sm">{r.reportedBy}</td>
                <td className="text-ink-mute text-sm">{r.reason}</td>
                <td className="text-ink-mute text-sm">{new Date(r.date).toLocaleDateString()}</td>
                <td>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${STATUS_STYLES[r.status]}`}>
                    {r.status}
                  </span>
                </td>
                <td>
                  {r.status === 'Pending' && (
                    <button className="text-neon-bright text-xs font-semibold hover:underline">
                      Review
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-ink-faint text-sm">No reports yet</div>
        )}
      </div>
    </div>
  );
}
