'use client';

import { useEffect, useState } from 'react';
import { useDjAuth } from '@/components/DjAuthProvider';
import { djGet } from '@/lib/api';

interface SetlistTrack {
  title: string;
  artist: string;
  bpm?: number;
}

interface Setlist {
  id: string;
  eventName: string;
  venueName: string;
  date: string;
  tracks: SetlistTrack[];
}

export default function SetlistsPage() {
  const { token } = useDjAuth();
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const data = await djGet<{ setlists: Setlist[] }>('/dj/me/setlists', token);
        setSetlists(data.setlists || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, [token]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Setlists</h1>
        <p className="text-ink-mute text-sm mt-1">Your setlists grouped by event</p>
      </div>

      {loading ? (
        <div className="text-ink-mute">Loading setlists...</div>
      ) : setlists.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-white/[0.06] p-8 text-center text-ink-mute">
          No setlists yet. Your setlists will appear here after your events.
        </div>
      ) : (
        <div className="space-y-4">
          {setlists.map((sl) => (
            <div key={sl.id} className="bg-surface rounded-2xl border border-white/[0.06] overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === sl.id ? null : sl.id)}
                className="w-full p-5 text-left hover:bg-white/[0.02] transition flex items-center justify-between"
              >
                <div>
                  <p className="font-bold">{sl.eventName}</p>
                  <p className="text-ink-mute text-xs">{sl.venueName} &middot; {new Date(sl.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-ink-faint text-xs">{sl.tracks.length} tracks</span>
                  <span className="text-ink-faint text-sm">{expanded === sl.id ? '▲' : '▼'}</span>
                </div>
              </button>

              {expanded === sl.id && sl.tracks.length > 0 && (
                <div className="border-t border-white/[0.06]">
                  <table className="portal-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Track</th>
                        <th>Artist</th>
                        <th>BPM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sl.tracks.map((t, i) => (
                        <tr key={i}>
                          <td className="text-ink-faint w-12">{i + 1}</td>
                          <td className="font-medium">{t.title}</td>
                          <td className="text-ink-mute">{t.artist}</td>
                          <td className="text-ink-faint">{t.bpm || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
