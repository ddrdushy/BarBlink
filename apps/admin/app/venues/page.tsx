'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/components/AdminAuthProvider';
import { venueGet, venuePost } from '@/lib/api';

interface Venue {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  area: string | null;
  country: string;
  priceRange: number | null;
  crowdCapacity: number | null;
  status: string;
}

interface VenueList { items: Venue[]; total: number; page: number; totalPages: number }

export default function VenuesPage() {
  const { token } = useAdminAuth();
  const [data, setData] = useState<VenueList | null>(null);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newVenue, setNewVenue] = useState({ name: '', category: 'bar', area: '', country: 'MY', address: '', barClosesAt: '02:00', priceRange: 2, crowdCapacity: 100 });

  const fetchVenues = () => {
    if (!token) return;
    const params = new URLSearchParams({ limit: '50' });
    if (countryFilter) params.set('country', countryFilter);
    venueGet<VenueList>(`/venues?${params}`, token).then(setData).catch(() => {});
  };

  useEffect(fetchVenues, [token, countryFilter]);

  const handleAdd = async () => {
    if (!token || !newVenue.name) return;
    await venuePost('/admin/venues', newVenue, token);
    setShowAdd(false);
    setNewVenue({ name: '', category: 'bar', area: '', country: 'MY', address: '', barClosesAt: '02:00', priceRange: 2, crowdCapacity: 100 });
    fetchVenues();
  };

  const filtered = data?.items.filter((v) =>
    !search || v.name.toLowerCase().includes(search.toLowerCase()),
  ) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Venues</h1>
          <p className="text-ink-mute text-sm">{data?.total ?? 0} venues on platform</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2.5 rounded-xl bg-neon text-white text-sm font-bold hover:brightness-110 transition"
        >
          + Add Venue
        </button>
      </div>

      {/* Add venue form */}
      {showAdd && (
        <div className="bg-surface rounded-xl border border-neon-border p-6 mb-6">
          <h3 className="text-sm font-bold text-neon-bright mb-4">New Venue</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <input placeholder="Name" value={newVenue.name} onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })} className="px-3 py-2 rounded-lg bg-elevated border border-white/[0.06] text-sm text-ink outline-none focus:border-neon/60" />
            <select value={newVenue.category} onChange={(e) => setNewVenue({ ...newVenue, category: e.target.value })} className="px-3 py-2 rounded-lg bg-elevated border border-white/[0.06] text-sm text-ink outline-none">
              {['bar', 'club', 'rooftop', 'lounge', 'speakeasy', 'live_music'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input placeholder="Area" value={newVenue.area} onChange={(e) => setNewVenue({ ...newVenue, area: e.target.value })} className="px-3 py-2 rounded-lg bg-elevated border border-white/[0.06] text-sm text-ink outline-none focus:border-neon/60" />
            <select value={newVenue.country} onChange={(e) => setNewVenue({ ...newVenue, country: e.target.value })} className="px-3 py-2 rounded-lg bg-elevated border border-white/[0.06] text-sm text-ink outline-none">
              <option value="MY">Malaysia</option>
              <option value="LK">Sri Lanka</option>
            </select>
          </div>
          <div className="flex gap-3">
            <input placeholder="Address" value={newVenue.address} onChange={(e) => setNewVenue({ ...newVenue, address: e.target.value })} className="flex-1 px-3 py-2 rounded-lg bg-elevated border border-white/[0.06] text-sm text-ink outline-none focus:border-neon/60" />
            <button onClick={handleAdd} className="px-6 py-2 rounded-lg bg-neon text-white text-sm font-bold hover:brightness-110">Save</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-ink-mute text-sm hover:text-ink">Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          placeholder="Search venues..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-xs px-4 py-2.5 rounded-xl bg-surface border border-white/[0.06] text-sm text-ink outline-none focus:border-neon/60 transition"
        />
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-surface border border-white/[0.06] text-sm text-ink outline-none"
        >
          <option value="">All Countries</option>
          <option value="MY">Malaysia</option>
          <option value="LK">Sri Lanka</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Area</th>
              <th>Country</th>
              <th>Price</th>
              <th>Capacity</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id}>
                <td className="font-semibold">{v.name}</td>
                <td className="capitalize text-ink-mute">{v.category}</td>
                <td className="capitalize text-ink-mute">{v.area?.replace(/_/g, ' ')}</td>
                <td>{v.country === 'MY' ? '🇲🇾' : '🇱🇰'}</td>
                <td className="text-ink-mute">{'$'.repeat(v.priceRange || 0)}</td>
                <td className="text-ink-mute">{v.crowdCapacity || '—'}</td>
                <td>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${v.status === 'active' ? 'bg-live/20 text-live' : 'bg-danger/20 text-danger'}`}>
                    {v.status}
                  </span>
                </td>
                <td>
                  <Link href={`/venues/${v.id}`} className="text-neon-bright text-xs font-semibold hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-ink-faint text-sm">No venues found</div>
        )}
      </div>
    </div>
  );
}
