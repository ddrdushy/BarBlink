'use client';

import { useEffect, useState } from 'react';
import { useDjAuth } from '@/components/DjAuthProvider';
import { djGet } from '@/lib/api';

interface DjEvent {
  id: string;
  name: string;
  venueName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

export default function EventsPage() {
  const { token } = useDjAuth();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [events, setEvents] = useState<DjEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await djGet<{ events: DjEvent[] }>(`/dj/me/events?type=${tab}`, token);
        setEvents(data.events || []);
      } catch {
        setEvents([]);
      }
      setLoading(false);
    };
    load();
  }, [token, tab]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Events</h1>
        <p className="text-ink-mute text-sm mt-1">Your gigs and performances</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-elevated rounded-xl p-1 w-fit">
        {(['upcoming', 'past'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t ? 'bg-neon text-white' : 'text-ink-mute hover:text-ink'
            }`}>
            {t === 'upcoming' ? 'Upcoming' : 'Past'}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-2xl border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-ink-mute">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-ink-mute">
            No {tab} events
          </div>
        ) : (
          <table className="portal-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Venue</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="font-medium">{e.name}</td>
                  <td className="text-ink-mute">{e.venueName}</td>
                  <td className="text-ink-mute">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="text-ink-faint text-xs">{e.startTime} - {e.endTime}</td>
                  <td>
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      e.status === 'confirmed' ? 'bg-live/20 text-live' :
                      e.status === 'pending' ? 'bg-amber/20 text-amber' :
                      'bg-white/5 text-ink-faint'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
