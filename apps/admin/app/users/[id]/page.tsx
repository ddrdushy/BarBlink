'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/components/AdminAuthProvider';
import { userGet, userPut } from '@/lib/api';

interface UserDetail {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  country: string;
  drinkPrefs: string[];
  goingTonight: boolean;
  createdAt: string;
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAdminAuth();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    if (!id || !token) return;
    userGet<UserDetail>(`/users/${id}`, token).then(setUser).catch(() => {});
  }, [id, token]);

  const handleAction = async (status: string) => {
    if (!token || !id) return;
    const reason = prompt(`Reason for ${status}:`);
    if (!reason) return;
    await userPut(`/admin/users/${id}/status`, { status }, token);
    setActionMsg(`User ${status} successfully`);
    setTimeout(() => setActionMsg(''), 3000);
  };

  if (!user) return <div className="text-ink-mute py-20 text-center">Loading...</div>;

  const flag = user.country === 'MY' ? '🇲🇾' : user.country === 'LK' ? '🇱🇰' : '';

  return (
    <div className="max-w-[800px]">
      <button onClick={() => router.push('/users')} className="text-ink-mute text-sm hover:text-ink mb-4 block">
        ← Back to users
      </button>

      {/* Profile Header */}
      <div className="bg-surface rounded-xl border border-white/[0.06] p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-elevated border-2 border-neon-border flex items-center justify-center text-3xl">
            🦉
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-ink">@{user.username}</h1>
            <p className="text-ink-mute text-sm mt-1">{user.displayName} {flag}</p>
            {user.bio && <p className="text-ink-faint text-sm mt-2">{user.bio}</p>}
            <div className="flex gap-4 mt-3 text-xs text-ink-faint">
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              <span>Country: {user.country}</span>
              {user.goingTonight && <span className="text-live font-semibold">Going out tonight</span>}
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-md bg-live/20 text-live">Active</span>
        </div>
      </div>

      {actionMsg && (
        <div className="bg-live/10 border border-live/30 text-live text-sm font-semibold rounded-xl px-4 py-3 mb-6">
          {actionMsg}
        </div>
      )}

      {/* Admin Actions */}
      <div className="bg-surface rounded-xl border border-white/[0.06] p-6 mb-6">
        <h3 className="text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-4">Admin Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button onClick={() => handleAction('suspended')} className="px-4 py-2.5 rounded-lg border border-amber/40 text-amber text-sm font-semibold hover:bg-amber/10 transition">
            Suspend (7 days)
          </button>
          <button onClick={() => handleAction('banned')} className="px-4 py-2.5 rounded-lg border border-danger/40 text-danger text-sm font-semibold hover:bg-danger/10 transition">
            Ban Permanently
          </button>
          <button className="px-4 py-2.5 rounded-lg border border-white/[0.06] text-ink-mute text-sm font-semibold hover:bg-white/[0.04] transition">
            Force Logout
          </button>
          <button className="px-4 py-2.5 rounded-lg border border-white/[0.06] text-ink-mute text-sm font-semibold hover:bg-white/[0.04] transition">
            Reset Avatar
          </button>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface rounded-xl border border-white/[0.06] p-4 text-center">
          <div className="text-2xl font-extrabold text-ink">0</div>
          <div className="text-[11px] text-ink-mute font-semibold mt-1">Posts</div>
        </div>
        <div className="bg-surface rounded-xl border border-white/[0.06] p-4 text-center">
          <div className="text-2xl font-extrabold text-ink">0</div>
          <div className="text-[11px] text-ink-mute font-semibold mt-1">Check-ins</div>
        </div>
        <div className="bg-surface rounded-xl border border-white/[0.06] p-4 text-center">
          <div className="text-2xl font-extrabold text-ink">0</div>
          <div className="text-[11px] text-ink-mute font-semibold mt-1">Reports Against</div>
        </div>
      </div>

      {/* Drink Preferences */}
      {user.drinkPrefs.length > 0 && (
        <div className="bg-surface rounded-xl border border-white/[0.06] p-6 mb-6">
          <h3 className="text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-3">Drink Preferences</h3>
          <div className="flex gap-2 flex-wrap">
            {user.drinkPrefs.map((d) => (
              <span key={d} className="px-3 py-1 rounded-lg bg-neon-ghost border border-neon-border text-neon-bright text-xs font-semibold">{d}</span>
            ))}
          </div>
        </div>
      )}

      {/* Suspension Log (placeholder) */}
      <div className="bg-surface rounded-xl border border-white/[0.06] p-6">
        <h3 className="text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-3">Suspension Log</h3>
        <p className="text-ink-faint text-sm">No suspensions on record.</p>
      </div>
    </div>
  );
}
