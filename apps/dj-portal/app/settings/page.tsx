'use client';

import { useState } from 'react';
import { useDjAuth } from '@/components/DjAuthProvider';
import { authPost } from '@/lib/api';

export default function SettingsPage() {
  const { token } = useDjAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match');
    }
    if (newPassword.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setLoading(true);
    try {
      await authPost('/auth/dj/change-password', {
        currentPassword,
        newPassword,
      }, token || undefined);
      setMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setError(e?.message || 'Failed to change password');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-ink-mute text-sm mt-1">Account settings</p>
      </div>

      <div className="bg-surface rounded-2xl border border-white/[0.06] p-6 max-w-md">
        <h2 className="text-lg font-bold mb-4">Change Password</h2>

        <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Current Password</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />

        <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">New Password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Min 8 characters"
          className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />

        <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Confirm New Password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password"
          className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />

        {error && <p className="text-danger text-xs mb-3">{error}</p>}
        {message && <p className="text-live text-xs mb-3">{message}</p>}

        <button onClick={handleChangePassword}
          disabled={!currentPassword || !newPassword || !confirmPassword || loading}
          className="px-6 py-3 rounded-xl bg-neon text-white text-sm font-bold disabled:opacity-40 hover:brightness-110 transition">
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </div>
  );
}
