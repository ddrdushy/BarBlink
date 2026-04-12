'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/components/AdminAuthProvider';
import { djGet, djPost } from '@/lib/api';

interface Dj {
  id: string;
  name: string;
  slug: string;
  type: string;
  genreTags: string[];
  country: string;
  status: string;
}

interface DjList { items: Dj[]; total: number }

export default function DjsPage() {
  const { token } = useAdminAuth();
  const [data, setData] = useState<DjList | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'dj', genreTags: '', country: 'MY' });

  const fetch = () => {
    if (!token) return;
    djGet<DjList>('/dj?limit=50', token).then(setData).catch(() => {});
  };
  useEffect(fetch, [token]);

  const handleAdd = async () => {
    if (!token || !form.name) return;
    await djPost('/admin/dj', {
      name: form.name,
      type: form.type,
      genreTags: form.genreTags.split(',').map(s => s.trim()).filter(Boolean),
      country: form.country,
    }, token);
    setShowAdd(false);
    setForm({ name: '', type: 'dj', genreTags: '', country: 'MY' });
    fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">DJs & Bands</h1>
          <p className="text-ink-mute text-sm">{data?.total ?? 0} profiles</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2.5 rounded-xl bg-neon text-white text-sm font-bold hover:brightness-110 transition">
          + Add DJ
        </button>
      </div>

      {showAdd && (
        <div className="bg-surface rounded-xl border border-neon-border p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded-lg bg-elevated border border-white/[0.06] text-sm text-ink outline-none focus:border-neon/60" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-3 py-2 rounded-lg bg-elevated border border-white/[0.06] text-sm text-ink outline-none">
              <option value="dj">DJ</option>
              <option value="band">Band</option>
            </select>
            <input placeholder="Genres (comma sep)" value={form.genreTags} onChange={(e) => setForm({ ...form, genreTags: e.target.value })} className="px-3 py-2 rounded-lg bg-elevated border border-white/[0.06] text-sm text-ink outline-none focus:border-neon/60" />
            <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="px-3 py-2 rounded-lg bg-elevated border border-white/[0.06] text-sm text-ink outline-none">
              <option value="MY">Malaysia</option>
              <option value="LK">Sri Lanka</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd} className="px-6 py-2 rounded-lg bg-neon text-white text-sm font-bold hover:brightness-110">Save</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-ink-mute text-sm hover:text-ink">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Type</th><th>Genres</th><th>Country</th><th>Status</th></tr></thead>
          <tbody>
            {(data?.items || []).map((d) => (
              <tr key={d.id}>
                <td className="font-semibold">{d.name}</td>
                <td className="capitalize text-ink-mute">{d.type}</td>
                <td className="text-ink-mute text-sm">{d.genreTags.join(', ') || '—'}</td>
                <td>{d.country === 'MY' ? '🇲🇾' : '🇱🇰'}</td>
                <td><span className={`text-xs font-bold px-2 py-1 rounded-md ${d.status === 'active' ? 'bg-live/20 text-live' : 'bg-danger/20 text-danger'}`}>{d.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {(data?.items || []).length === 0 && <div className="py-12 text-center text-ink-faint text-sm">No DJs yet. Add one above.</div>}
      </div>
    </div>
  );
}
