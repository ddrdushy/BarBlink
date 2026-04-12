'use client';

import { useState, useMemo } from 'react';
import { useAdminAuth } from '@/components/AdminAuthProvider';
import { StatsCard } from '@/components/StatsCard';

type TimeTab = 'This Week' | 'Last Week' | 'All Time';
type CountryFilter = 'All' | 'Malaysia' | 'Sri Lanka';

interface LeaderboardUser {
  id: string;
  username: string;
  checkins: number;
  posts: number;
  country: 'Malaysia' | 'Sri Lanka';
}

const MOCK_USERS: LeaderboardUser[] = [
  { id: '1', username: 'maya_kl', checkins: 42, posts: 18, country: 'Malaysia' },
  { id: '2', username: 'arun.nightlife', checkins: 38, posts: 22, country: 'Sri Lanka' },
  { id: '3', username: 'siti_party', checkins: 35, posts: 15, country: 'Malaysia' },
  { id: '4', username: 'james.w', checkins: 30, posts: 12, country: 'Malaysia' },
  { id: '5', username: 'priya_m', checkins: 28, posts: 20, country: 'Sri Lanka' },
  { id: '6', username: 'kevin_t', checkins: 25, posts: 10, country: 'Malaysia' },
  { id: '7', username: 'farah.a', checkins: 22, posts: 14, country: 'Malaysia' },
  { id: '8', username: 'daniel_lim', checkins: 20, posts: 8, country: 'Malaysia' },
  { id: '9', username: 'nina.r', checkins: 18, posts: 16, country: 'Sri Lanka' },
  { id: '10', username: 'raj_k', checkins: 15, posts: 11, country: 'Sri Lanka' },
];

const MEDAL = ['🥇', '🥈', '🥉'];
const BORDER_COLORS = ['border-l-yellow-400', 'border-l-gray-300', 'border-l-amber-600'];
const FLAG: Record<string, string> = { Malaysia: '🇲🇾', 'Sri Lanka': '🇱🇰' };

function calcScore(u: LeaderboardUser) {
  return u.checkins * 20 + u.posts * 10;
}

export default function LeaderboardPage() {
  useAdminAuth();
  const [timeTab, setTimeTab] = useState<TimeTab>('This Week');
  const [countryFilter, setCountryFilter] = useState<CountryFilter>('All');

  const filtered = useMemo(() => {
    let users = [...MOCK_USERS];
    if (countryFilter !== 'All') {
      users = users.filter((u) => u.country === countryFilter);
    }
    return users.sort((a, b) => calcScore(b) - calcScore(a));
  }, [countryFilter]);

  const topScore = filtered.length > 0 ? calcScore(filtered[0]) : 0;
  const totalCheckins = filtered.reduce((s, u) => s + u.checkins, 0);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">Leaderboard</h1>
      <p className="text-ink-mute text-sm mb-6">Top users by activity score</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatsCard label="Top Score" value={topScore} icon="🏆" accent="text-yellow-400" />
        <StatsCard label="Total Check-ins" value={totalCheckins} icon="📍" accent="text-neon-bright" />
        <StatsCard label="Active Users" value={filtered.length} icon="👥" accent="text-live" />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        {/* Time tabs */}
        <div className="flex gap-1">
          {(['This Week', 'Last Week', 'All Time'] as TimeTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setTimeTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                timeTab === tab
                  ? 'bg-neon text-white'
                  : 'bg-surface text-ink-mute hover:text-ink'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Country filter */}
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value as CountryFilter)}
          className="bg-surface border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-neon/40"
        >
          <option value="All">All Countries</option>
          <option value="Malaysia">Malaysia</option>
          <option value="Sri Lanka">Sri Lanka</option>
        </select>
      </div>

      <div className="bg-surface rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Check-ins</th>
              <th>Posts</th>
              <th>Score</th>
              <th>Country</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => {
              const score = calcScore(u);
              const isTop3 = i < 3;
              return (
                <tr
                  key={u.id}
                  className={isTop3 ? `border-l-4 ${BORDER_COLORS[i]}` : ''}
                >
                  <td className="w-16">
                    {isTop3 ? (
                      <span className="text-lg">{MEDAL[i]}</span>
                    ) : (
                      <span className="text-ink-mute font-mono">{i + 1}</span>
                    )}
                  </td>
                  <td className="font-semibold">@{u.username}</td>
                  <td className="text-ink-mute">{u.checkins}</td>
                  <td className="text-ink-mute">{u.posts}</td>
                  <td>
                    <span className="text-neon-bright font-bold">{score}</span>
                  </td>
                  <td>
                    <span className="text-sm">{FLAG[u.country]} {u.country}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-ink-faint text-sm">No users found</div>
        )}
      </div>

      <p className="text-ink-faint text-xs mt-4 text-center">
        Score = (Check-ins x 20) + (Posts x 10)
      </p>
    </div>
  );
}
