'use client';

import { useEffect, useState } from 'react';
import { useDjAuth } from '@/components/DjAuthProvider';
import { djGet, djPut } from '@/lib/api';

const GENRES = ['House', 'Techno', 'Hip-Hop', 'R&B', 'EDM', 'Pop', 'Afrobeat', 'Reggaeton', 'Drum & Bass', 'Trance', 'Deep House', 'Open Format', 'Other'];

interface DjProfile {
  id: string;
  stageName: string;
  type: string;
  genres: string[];
  bio: string;
  instagram: string;
}

export default function ProfilePage() {
  const { token } = useDjAuth();
  const [profile, setProfile] = useState<DjProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Editable fields
  const [bio, setBio] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [instagram, setInstagram] = useState('');

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const p = await djGet<DjProfile>('/dj/me', token);
        setProfile(p);
        setBio(p.bio || '');
        setSelectedGenres(p.genres || []);
        setInstagram(p.instagram || '');
      } catch {}
      setLoading(false);
    };
    load();
  }, [token]);

  const toggleGenre = (g: string) => {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setMessage('');
    try {
      await djPut('/dj/me', { bio, genres: selectedGenres, instagram }, token);
      setMessage('Profile updated successfully');
    } catch (e: any) {
      setMessage(e?.message || 'Failed to update');
    }
    setSaving(false);
  };

  if (loading) return <div className="text-ink-mute">Loading profile...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">My Profile</h1>
        <p className="text-ink-mute text-sm mt-1">Manage your DJ profile</p>
      </div>

      <div className="bg-surface rounded-2xl border border-white/[0.06] p-6 max-w-2xl">
        {/* Read-only fields */}
        <div className="mb-6 pb-6 border-b border-white/[0.06]">
          <p className="text-[11px] font-bold tracking-wider uppercase text-ink-faint mb-3">Read-only (Contact support to change)</p>
          <div>
            <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-1">Stage Name</label>
            <p className="px-4 py-3 rounded-xl bg-elevated/50 border border-white/[0.04] text-ink-mute text-sm">
              {profile?.stageName || '-'}
            </p>
          </div>
        </div>

        {/* Editable fields */}
        <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Tell your audience about yourself..."
          className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4 resize-none" />

        <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Genres</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {GENRES.map((g) => (
            <button key={g} onClick={() => toggleGenre(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedGenres.includes(g)
                  ? 'bg-neon text-white'
                  : 'bg-elevated text-ink-mute hover:text-ink'
              }`}>
              {g}
            </button>
          ))}
        </div>

        <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Instagram</label>
        <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/djnova"
          className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />

        {message && (
          <p className={`text-xs mb-3 ${message.includes('success') ? 'text-live' : 'text-danger'}`}>{message}</p>
        )}

        <button onClick={handleSave} disabled={saving}
          className="px-6 py-3 rounded-xl bg-neon text-white text-sm font-bold disabled:opacity-40 hover:brightness-110 transition">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
