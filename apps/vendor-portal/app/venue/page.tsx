'use client';

import { useEffect, useState } from 'react';
import { useVendorAuth } from '@/components/VendorAuthProvider';
import { venueGet, venuePut } from '@/lib/api';

interface VenueData {
  id: string;
  name: string;
  address: string;
  category: string;
  description: string;
  closingTime: string;
  phone: string;
  website: string;
}

export default function VenuePage() {
  const { token } = useVendorAuth();
  const [venue, setVenue] = useState<VenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Editable fields
  const [description, setDescription] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const v = await venueGet<VenueData>('/vendor/venue', token);
        setVenue(v);
        setDescription(v.description || '');
        setClosingTime(v.closingTime || '');
        setPhone(v.phone || '');
        setWebsite(v.website || '');
      } catch {}
      setLoading(false);
    };
    load();
  }, [token]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setMessage('');
    try {
      await venuePut('/vendor/venue', { description, closingTime, phone, website }, token);
      setMessage('Venue updated successfully');
    } catch (e: any) {
      setMessage(e?.message || 'Failed to update');
    }
    setSaving(false);
  };

  if (loading) return <div className="text-ink-mute">Loading venue...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">My Venue</h1>
        <p className="text-ink-mute text-sm mt-1">Manage your venue information</p>
      </div>

      <div className="bg-surface rounded-2xl border border-white/[0.06] p-6 max-w-2xl">
        {/* Read-only fields */}
        <div className="mb-6 pb-6 border-b border-white/[0.06]">
          <p className="text-[11px] font-bold tracking-wider uppercase text-ink-faint mb-3">Read-only (Contact support to change)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-1">Venue Name</label>
              <p className="px-4 py-3 rounded-xl bg-elevated/50 border border-white/[0.04] text-ink-mute text-sm">{venue?.name || '-'}</p>
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-1">Category</label>
              <p className="px-4 py-3 rounded-xl bg-elevated/50 border border-white/[0.04] text-ink-mute text-sm">{venue?.category || '-'}</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-1">Address</label>
              <p className="px-4 py-3 rounded-xl bg-elevated/50 border border-white/[0.04] text-ink-mute text-sm">{venue?.address || '-'}</p>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe your venue..."
          className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4 resize-none" />

        <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Closing Time</label>
        <input type="text" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} placeholder="e.g. 2:00 AM"
          className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />

        <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Phone</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+60 12 345 6789"
          className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />

        <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Website</label>
        <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourvenue.com"
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
