'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/components/AdminAuthProvider';
import { userGet, userPut } from '@/lib/api';

interface User {
  id: string;
  username: string;
  displayName: string | null;
  country: string;
  createdAt: string;
}

interface UserList { items: User[]; total: number; page: number; totalPages: number }

export default function UsersPage() {
  const { token } = useAdminAuth();
  const [data, setData] = useState<UserList | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!token) return;
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    userGet<UserList>(`/admin/users?${params}`, token).then(setData).catch(() => {});
  }, [token, page, search]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">Users</h1>
      <p className="text-ink-mute text-sm mb-6">{data?.total ?? 0} registered users</p>

      <input
        placeholder="Search by username..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="max-w-xs px-4 py-2.5 rounded-xl bg-surface border border-white/[0.06] text-sm text-ink outline-none focus:border-neon/60 transition mb-4"
      />

      <div className="bg-surface rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Display Name</th>
              <th>Country</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((u) => (
              <tr key={u.id}>
                <td className="font-semibold">@{u.username}</td>
                <td className="text-ink-mute">{u.displayName || '—'}</td>
                <td>{u.country === 'MY' ? '🇲🇾' : u.country === 'LK' ? '🇱🇰' : u.country}</td>
                <td className="text-ink-mute text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!token) return;
                      await userPut(`/admin/users/${u.id}/status`, { status: 'suspended' }, token);
                    }}
                    className="text-amber text-xs font-semibold hover:underline"
                  >
                    Suspend
                  </button>
                  <button
                    onClick={async () => {
                      if (!token) return;
                      await userPut(`/admin/users/${u.id}/status`, { status: 'banned' }, token);
                    }}
                    className="text-danger text-xs font-semibold hover:underline"
                  >
                    Ban
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(data?.items || []).length === 0 && (
          <div className="py-12 text-center text-ink-faint text-sm">No users found</div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex gap-2 mt-4 justify-center">
          {Array.from({ length: data.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded-lg text-sm ${page === i + 1 ? 'bg-neon text-white' : 'bg-surface text-ink-mute hover:text-ink'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
