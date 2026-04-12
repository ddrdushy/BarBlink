'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/components/AdminAuthProvider';
import { eventsGet, eventsPost } from '@/lib/api';

interface Event {
  id: string;
  name: string;
  venueId: string;
  date: string;
  startTime: string;
  country: string;
  status: string;
  _count?: { rsvps: number };
}

interface EventList { items: Event[]; total: number }

export default function EventsPage() {
  const { token } = useAdminAuth();
  const [data, setData] = useState<EventList | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', venueId: '', date: '', startTime: '22:00', country: 'MY' });

  const fetch = () => {
    if (!token) return;
    eventsGet<EventList>('/events?limit=50', token).then(setData).catch(() => {});
  };
  useEffect(fetch, [token]);

  const handleAdd = async () => {
    if (!token || !form.name || !form.date) return;
    await eventsPost('/admin/events', form, token);
    setShowAdd(false);
    setForm({ name: '', venueId: '', date: '', startTime: '22:00', country: 'MY' });
    fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Events</h1>
          <p className="text-ink-mute text-sm">{data?.total ?? 0} events</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2.5 rounded-xl bg-neon text-white text-sm font-bold hover:brightness-110 transition">
          + Add Event
        </button>
      </div>

      {showAdd && (
        <div className="bg-surface rounded-xl border border-neon-border p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <input placeholder="Event name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded-lg bg-elevated border border-white/[0.06] text-sm text-ink outline-none focus:border-neon/60" />
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="px-3 py-2 rounded-lg bg-elevated border border-white/[0.06] text-sm text-ink outline-none focus:border-neon/60" />
            <input placeholder="Start time (22:00)" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="px-3 py-2 rounded-lg bg-elevated border border-white/[0.06] text-sm text-ink outline-none focus:border-neon/60" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd} className="px-6 py-2 rounded-lg bg-neon text-white text-sm font-bold hover:brightness-110">Save</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-ink-mute text-sm hover:text-ink">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="admin-table">
          <thead><tr><th>Event</th><th>Date</th><th>Time</th><th>Country</th><th>RSVPs</th><th>Status</th></tr></thead>
          <tbody>
            {(data?.items || []).map((e) => (
              <tr key={e.id}>
                <td className="font-semibold">{e.name}</td>
                <td className="text-ink-mute">{new Date(e.date).toLocaleDateString()}</td>
                <td className="text-ink-mute">{e.startTime}</td>
                <td>{e.country === 'MY' ? '🇲🇾' : '🇱🇰'}</td>
                <td className="text-ink-mute">{e._count?.rsvps ?? 0}</td>
                <td><span className={`text-xs font-bold px-2 py-1 rounded-md ${e.status === 'upcoming' ? 'bg-neon-ghost text-neon-bright' : e.status === 'ongoing' ? 'bg-live/20 text-live' : 'bg-white/5 text-ink-faint'}`}>{e.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {(data?.items || []).length === 0 && <div className="py-12 text-center text-ink-faint text-sm">No events yet. Add one above.</div>}
      </div>
    </div>
  );
}
