'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/components/AdminAuthProvider';
import { StatsCard } from '@/components/StatsCard';
import { scraperGet, scraperPost, venueGet } from '@/lib/api';

interface ScraperStats { totalJobs: number; failedJobs: number; totalScraped: number }
interface ScrapeJob { id: string; venueId: string; source: string; status: string; errorMsg: string | null; itemsSynced: number; startedAt: string; finishedAt: string | null }

export default function ScraperPage() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<ScraperStats | null>(null);
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [venueId, setVenueId] = useState('');
  const [scraping, setScraping] = useState(false);
  const [venues, setVenues] = useState<{ id: string; name: string }[]>([]);

  const fetch = () => {
    if (!token) return;
    scraperGet<ScraperStats>('/admin/scraper/stats', token).then(setStats).catch(() => {});
    scraperGet<ScrapeJob[]>('/admin/scraper/jobs', token).then(setJobs).catch(() => {});
    venueGet<{ items: { id: string; name: string }[] }>('/venues?limit=50', token).then((d) => setVenues(d.items)).catch(() => {});
  };
  useEffect(fetch, [token]);

  const handleScrape = async () => {
    if (!token || !venueId) return;
    setScraping(true);
    try {
      await scraperPost('/admin/scraper/scrape', { venueId, source: 'both' }, token);
      fetch();
    } catch { /* silent */ }
    setScraping(false);
  };

  const venueNames: Record<string, string> = {};
  venues.forEach((v) => { venueNames[v.id] = v.name; });

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">Scraper</h1>
      <p className="text-ink-mute text-sm mb-6">Instagram + Google venue data automation</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatsCard label="Total Jobs" value={stats?.totalJobs ?? 0} icon="🤖" />
        <StatsCard label="Failed" value={stats?.failedJobs ?? 0} icon="❌" accent={stats?.failedJobs ? 'text-danger' : ''} />
        <StatsCard label="Data Scraped" value={stats?.totalScraped ?? 0} icon="📦" accent="text-neon-bright" />
      </div>

      {/* Manual scrape trigger */}
      <div className="bg-surface rounded-xl border border-neon-border p-6 mb-6">
        <h3 className="text-sm font-bold text-neon-bright mb-4">Trigger Manual Scrape</h3>
        <div className="flex gap-3">
          <select
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-elevated border border-white/[0.06] text-sm text-ink outline-none"
          >
            <option value="">Select a venue...</option>
            {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <button
            onClick={handleScrape}
            disabled={!venueId || scraping}
            className="px-6 py-2 rounded-lg bg-neon text-white text-sm font-bold disabled:opacity-40 hover:brightness-110"
          >
            {scraping ? 'Scraping...' : 'Scrape Now'}
          </button>
        </div>
      </div>

      {/* Job history */}
      <h3 className="text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-3">Recent Jobs</h3>
      <div className="bg-surface rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="admin-table">
          <thead><tr><th>Venue</th><th>Source</th><th>Status</th><th>Items</th><th>Started</th><th>Error</th></tr></thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td className="font-semibold">{venueNames[j.venueId] || j.venueId.slice(0, 8)}</td>
                <td className="capitalize text-ink-mute">{j.source}</td>
                <td>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                    j.status === 'success' ? 'bg-live/20 text-live' :
                    j.status === 'failed' ? 'bg-danger/20 text-danger' :
                    'bg-amber/20 text-amber'
                  }`}>{j.status}</span>
                </td>
                <td className="text-ink-mute">{j.itemsSynced}</td>
                <td className="text-ink-mute text-sm">{new Date(j.startedAt).toLocaleString()}</td>
                <td className="text-danger text-xs max-w-[200px] truncate">{j.errorMsg || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {jobs.length === 0 && <div className="py-12 text-center text-ink-faint text-sm">No scrape jobs yet. Trigger one above.</div>}
      </div>
    </div>
  );
}
