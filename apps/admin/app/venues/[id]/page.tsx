'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/components/AdminAuthProvider';
import { venueGet, venuePut, checkinGet } from '@/lib/api';

interface VenueDetail {
  id: string; name: string; slug: string; description: string | null;
  category: string | null; area: string | null; country: string;
  address: string | null; instagramHandle: string | null;
  barClosesAt: string | null; kitchenClosesAt: string | null;
  priceRange: number | null; crowdCapacity: number | null;
  googleRating: string | null; status: string;
  vibeTags: string[]; genreTags: string[];
}

export default function VenueEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAdminAuth();
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [crowd, setCrowd] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id || !token) return;
    venueGet<VenueDetail>(`/venues/${id}`, token).then(setVenue).catch(() => {});
    checkinGet<{ count: number }>(`/checkins/venue/${id}`, token).then((r) => setCrowd(r.count)).catch(() => {});
  }, [id, token]);

  const save = async () => {
    if (!venue || !token) return;
    setSaving(true);
    try {
      await venuePut(`/admin/venues/${venue.id}`, {
        name: venue.name,
        description: venue.description,
        category: venue.category,
        area: venue.area,
        country: venue.country,
        address: venue.address,
        instagramHandle: venue.instagramHandle,
        barClosesAt: venue.barClosesAt,
        kitchenClosesAt: venue.kitchenClosesAt,
        priceRange: venue.priceRange,
        crowdCapacity: venue.crowdCapacity,
      }, token);
      router.push('/venues');
    } catch { /* silent */ }
    setSaving(false);
  };

  if (!venue) return <div className="text-ink-mute py-20 text-center">Loading...</div>;

  const f = (key: keyof VenueDetail, val: string | number | null) =>
    setVenue({ ...venue, [key]: val });

  return (
    <div className="max-w-[800px]">
      <button onClick={() => router.push('/venues')} className="text-ink-mute text-sm hover:text-ink mb-4 block">
        ← Back to venues
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">{venue.name}</h1>
        {crowd > 0 && (
          <span className="px-3 py-1 rounded-lg bg-live/20 text-live text-sm font-bold">
            {crowd} checked in now
          </span>
        )}
      </div>

      <div className="bg-surface rounded-xl border border-white/[0.06] p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" value={venue.name} onChange={(v) => f('name', v)} />
          <Field label="Category" value={venue.category || ''} onChange={(v) => f('category', v)} />
          <Field label="Area" value={venue.area || ''} onChange={(v) => f('area', v)} />
          <Field label="Country" value={venue.country} onChange={(v) => f('country', v)} />
          <Field label="Bar Closes At" value={venue.barClosesAt || ''} onChange={(v) => f('barClosesAt', v)} />
          <Field label="Kitchen Closes At" value={venue.kitchenClosesAt || ''} onChange={(v) => f('kitchenClosesAt', v)} />
          <Field label="Price Range (1-4)" value={String(venue.priceRange || '')} onChange={(v) => f('priceRange', parseInt(v) || null)} />
          <Field label="Crowd Capacity" value={String(venue.crowdCapacity || '')} onChange={(v) => f('crowdCapacity', parseInt(v) || null)} />
          <Field label="Instagram" value={venue.instagramHandle || ''} onChange={(v) => f('instagramHandle', v)} />
          <Field label="Status" value={venue.status} onChange={(v) => f('status', v)} />
        </div>
        <div>
          <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-1">Address</label>
          <input value={venue.address || ''} onChange={(e) => f('address', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-elevated border border-white/[0.06] text-sm text-ink outline-none focus:border-neon/60" />
        </div>
        <div>
          <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-1">Description</label>
          <textarea value={venue.description || ''} onChange={(e) => f('description', e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg bg-elevated border border-white/[0.06] text-sm text-ink outline-none focus:border-neon/60 resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-xl bg-neon text-white text-sm font-bold disabled:opacity-40 hover:brightness-110 transition">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={() => router.push('/venues')} className="px-4 py-2.5 rounded-xl text-ink-mute text-sm hover:text-ink transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-elevated border border-white/[0.06] text-sm text-ink outline-none focus:border-neon/60" />
    </div>
  );
}
