'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useVendorAuth } from '@/components/VendorAuthProvider';
import { venueGet } from '@/lib/api';

interface VenueStats {
  checkinsToday: number;
  totalReviews: number;
  averageRating: number;
  followers: number;
}

export default function DashboardPage() {
  const { token } = useVendorAuth();
  const [venueName, setVenueName] = useState('');
  const [stats, setStats] = useState<VenueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const venue = await venueGet<{ name: string }>('/vendor/venue', token);
        setVenueName(venue.name);
        const s = await venueGet<VenueStats>('/vendor/venue/stats', token);
        setStats(s);
      } catch {}
      setLoading(false);
    };
    load();
  }, [token]);

  const storedName = typeof window !== 'undefined' ? localStorage.getItem('bbk_vendor_name') : null;

  const statCards = [
    { label: 'Check-ins Today', value: stats?.checkinsToday ?? '-', color: 'text-neon' },
    { label: 'Reviews', value: stats?.totalReviews ?? '-', color: 'text-amber' },
    { label: 'Rating', value: stats?.averageRating ? stats.averageRating.toFixed(1) : '-', color: 'text-live' },
    { label: 'Followers', value: stats?.followers ?? '-', color: 'text-neon-bright' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">
          {venueName || storedName || 'Dashboard'}
        </h1>
        <p className="text-ink-mute text-sm mt-1">Welcome to your venue management portal</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-surface rounded-2xl border border-white/[0.06] p-5">
            <p className="text-ink-faint text-[11px] font-bold tracking-wider uppercase mb-2">{card.label}</p>
            <p className={`text-3xl font-extrabold ${card.color}`}>
              {loading ? '...' : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/venue" className="bg-surface rounded-2xl border border-white/[0.06] p-5 hover:border-neon-border transition group">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏛️</span>
            <div>
              <p className="font-bold group-hover:text-neon transition">Edit Venue</p>
              <p className="text-ink-mute text-xs">Update your venue details and hours</p>
            </div>
          </div>
        </Link>
        <Link href="/reviews" className="bg-surface rounded-2xl border border-white/[0.06] p-5 hover:border-neon-border transition group">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="font-bold group-hover:text-neon transition">View Reviews</p>
              <p className="text-ink-mute text-xs">See what guests are saying</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
