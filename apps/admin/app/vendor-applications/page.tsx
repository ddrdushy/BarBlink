'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAdminAuth } from '@/components/AdminAuthProvider';
import { StatsCard } from '@/components/StatsCard';
import { authGet, authPost } from '@/lib/api';

type FilterTab = 'Pending' | 'Approved' | 'Rejected' | 'All';

interface VendorApplication {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  businessType: string;
  instagramUrl: string | null;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
}

interface ApplicationsResponse {
  items: VendorApplication[];
  total: number;
  page: number;
  totalPages: number;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-live/20 text-live',
  rejected: 'bg-danger/20 text-danger',
};

export default function VendorApplicationsPage() {
  const { token } = useAdminAuth();
  const [filter, setFilter] = useState<FilterTab>('Pending');
  const [apps, setApps] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const statusParam =
        filter === 'Pending'
          ? '?status=pending'
          : filter === 'Approved'
            ? '?status=approved'
            : filter === 'Rejected'
              ? '?status=rejected'
              : '';
      const data = await authGet<ApplicationsResponse>(
        `/admin/vendor-applications${statusParam}`,
        token,
      );
      setApps(data.items);
    } catch {
      setApps([]);
    }
    setLoading(false);
  }, [token, filter]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const handleApprove = async (id: string) => {
    if (!token) return;
    try {
      await authPost(`/admin/vendor-applications/${id}/approve`, {}, token);
      setApps((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'approved' } : a)),
      );
    } catch {
      /* silent */
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Rejection reason:');
    if (!reason || !token) return;
    try {
      await authPost(`/admin/vendor-applications/${id}/reject`, { reason }, token);
      setApps((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: 'rejected', rejectionReason: reason } : a,
        ),
      );
    } catch {
      /* silent */
    }
  };

  const pendingCount = apps.filter((a) => a.status === 'pending').length;
  const approvedToday = apps.filter(
    (a) =>
      a.status === 'approved' &&
      new Date(a.createdAt).toDateString() === new Date().toDateString(),
  ).length;
  const rejectedCount = apps.filter((a) => a.status === 'rejected').length;

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">
        Vendor Applications
      </h1>
      <p className="text-ink-mute text-sm mb-6">
        Review and manage venue vendor registrations
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatsCard
          label="Pending"
          value={pendingCount}
          icon="🔔"
          accent={pendingCount > 0 ? 'text-yellow-400' : 'text-ink'}
        />
        <StatsCard
          label="Approved Today"
          value={approvedToday}
          icon="✅"
          accent="text-live"
        />
        <StatsCard
          label="Rejected"
          value={rejectedCount}
          icon="❌"
          accent="text-danger"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4">
        {(['Pending', 'Approved', 'Rejected', 'All'] as FilterTab[]).map(
          (tab) => (
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
          ),
        )}
      </div>

      <div className="bg-surface rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Type</th>
              <th>Instagram</th>
              <th>Submitted</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a.id}>
                <td className="font-semibold">{a.businessName}</td>
                <td className="text-ink-mute text-sm">{a.contactName}</td>
                <td className="text-ink-mute text-sm">{a.email}</td>
                <td>
                  <span className="text-xs font-bold px-2 py-1 rounded-md bg-white/5 text-ink-mute">
                    {a.businessType}
                  </span>
                </td>
                <td className="text-sm">
                  {a.instagramUrl ? (
                    <a
                      href={a.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neon-bright hover:underline"
                    >
                      {a.instagramUrl.replace(/\/$/, '').split('/').pop()}
                    </a>
                  ) : (
                    <span className="text-ink-faint">--</span>
                  )}
                </td>
                <td className="text-ink-mute text-sm">
                  {new Date(a.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-md ${STATUS_STYLES[a.status] || 'bg-white/5 text-ink-mute'}`}
                  >
                    {a.status}
                  </span>
                </td>
                <td>
                  {a.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(a.id)}
                        className="text-live text-xs font-semibold hover:underline"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(a.id)}
                        className="text-danger text-xs font-semibold hover:underline"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {a.status === 'rejected' && a.rejectionReason && (
                    <span
                      className="text-xs text-ink-faint cursor-help"
                      title={a.rejectionReason}
                    >
                      {a.rejectionReason.slice(0, 30)}
                      {a.rejectionReason.length > 30 ? '...' : ''}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && apps.length === 0 && (
          <div className="py-12 text-center text-ink-faint text-sm">
            No vendor applications found
          </div>
        )}
        {loading && (
          <div className="py-12 text-center text-ink-faint text-sm">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
