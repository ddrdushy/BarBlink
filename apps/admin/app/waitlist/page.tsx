'use client';

import { useState, useMemo } from 'react';
import { useAdminAuth } from '@/components/AdminAuthProvider';
import { StatsCard } from '@/components/StatsCard';

interface WaitlistEntry {
  id: string;
  email: string;
  source: string;
  createdAt: string;
}

// Mock data — replace with real API when waitlist backend is ready
const MOCK_WAITLIST: WaitlistEntry[] = [
  { id: '1', email: 'maya@gmail.com', source: 'landing_page', createdAt: '2026-04-12T09:15:00Z' },
  { id: '2', email: 'arun.k@hotmail.com', source: 'landing_page', createdAt: '2026-04-12T08:30:00Z' },
  { id: '3', email: 'siti.nurhaliza@yahoo.com', source: 'landing_page', createdAt: '2026-04-11T22:10:00Z' },
  { id: '4', email: 'james.wong@gmail.com', source: 'landing_page', createdAt: '2026-04-11T19:45:00Z' },
  { id: '5', email: 'priya.m@outlook.com', source: 'landing_page', createdAt: '2026-04-11T14:20:00Z' },
  { id: '6', email: 'kevin.tan@gmail.com', source: 'landing_page', createdAt: '2026-04-10T23:00:00Z' },
  { id: '7', email: 'farah.a@gmail.com', source: 'landing_page', createdAt: '2026-04-10T17:30:00Z' },
  { id: '8', email: 'daniel.lim@yahoo.com', source: 'landing_page', createdAt: '2026-04-09T12:15:00Z' },
  { id: '9', email: 'nina.r@hotmail.com', source: 'landing_page', createdAt: '2026-04-08T20:40:00Z' },
  { id: '10', email: 'raj.kumar@gmail.com', source: 'landing_page', createdAt: '2026-04-07T10:00:00Z' },
];

const PAGE_SIZE = 5;

export default function WaitlistPage() {
  useAdminAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showLaunchConfirm, setShowLaunchConfirm] = useState(false);

  const now = new Date();
  const todayStr = now.toDateString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const addedToday = MOCK_WAITLIST.filter((e) => new Date(e.createdAt).toDateString() === todayStr).length;
  const addedThisWeek = MOCK_WAITLIST.filter((e) => new Date(e.createdAt) >= weekAgo).length;

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_WAITLIST;
    const q = search.toLowerCase();
    return MOCK_WAITLIST.filter((e) => e.email.toLowerCase().includes(q));
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExportCSV = () => {
    const header = 'Email,Source,Date Added\n';
    const rows = MOCK_WAITLIST.map(
      (e) => `${e.email},${e.source},${new Date(e.createdAt).toISOString()}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'barblink-waitlist.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendLaunchEmail = () => {
    // Placeholder — will integrate with email service
    setShowLaunchConfirm(false);
    alert(`Launch email would be sent to ${MOCK_WAITLIST.length} subscribers.`);
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">Waitlist</h1>
      <p className="text-ink-mute text-sm mb-6">{MOCK_WAITLIST.length} total signups</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatsCard label="Total Emails" value={MOCK_WAITLIST.length} icon="📧" accent="text-neon-bright" />
        <StatsCard label="Added Today" value={addedToday} icon="🆕" accent="text-live" />
        <StatsCard label="This Week" value={addedThisWeek} icon="📅" accent="text-neon-bright" />
      </div>

      {/* Actions bar */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 bg-surface border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-neon/40"
        />
        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-surface border border-white/[0.06] text-ink-mute hover:text-ink transition"
        >
          Export CSV
        </button>
        <button
          onClick={() => setShowLaunchConfirm(true)}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-neon text-white hover:bg-neon/90 transition"
        >
          Send Launch Email
        </button>
      </div>

      {/* Launch email confirm dialog */}
      {showLaunchConfirm && (
        <div className="mb-4 bg-surface rounded-xl border border-neon/30 p-5">
          <p className="text-sm font-semibold mb-2">
            Send launch email to {MOCK_WAITLIST.length} subscribers?
          </p>
          <p className="text-ink-mute text-xs mb-4">
            This will notify all waitlist users that Barblink is live. This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleSendLaunchEmail}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-neon text-white hover:bg-neon/90 transition"
            >
              Confirm Send
            </button>
            <button
              onClick={() => setShowLaunchConfirm(false)}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-surface border border-white/[0.06] text-ink-mute hover:text-ink transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Source</th>
              <th>Date Added</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((e) => (
              <tr key={e.id}>
                <td className="font-medium">{e.email}</td>
                <td>
                  <span className="text-xs font-bold px-2 py-1 rounded-md bg-white/5 text-ink-mute">
                    {e.source}
                  </span>
                </td>
                <td className="text-ink-mute text-sm">{new Date(e.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginated.length === 0 && (
          <div className="py-12 text-center text-ink-faint text-sm">No matching emails</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 mt-4 justify-center">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded-lg text-sm ${
                page === i + 1 ? 'bg-neon text-white' : 'bg-surface text-ink-mute hover:text-ink'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
