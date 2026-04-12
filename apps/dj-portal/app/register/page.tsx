'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authPost } from '@/lib/api';

const DJ_TYPES = ['DJ', 'Band', 'Live Act', 'Producer', 'Other'];
const GENRES = ['House', 'Techno', 'Hip-Hop', 'R&B', 'EDM', 'Pop', 'Afrobeat', 'Reggaeton', 'Drum & Bass', 'Trance', 'Deep House', 'Open Format', 'Other'];

interface SearchResult {
  id: string;
  stageName: string;
  type: string;
  genres: string[];
}

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [path, setPath] = useState<'new' | 'claim' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // Step 2a: New DJ info
  const [stageName, setStageName] = useState('');
  const [djType, setDjType] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');

  // Step 2b: Claim profile
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [claimId, setClaimId] = useState('');
  const [claimName, setClaimName] = useState('');

  // Step 3: Account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  const toggleGenre = (g: string) => {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await authPost<{ results: SearchResult[] }>('/auth/dj/search', { query: searchQuery });
      setSearchResults(res.results || []);
    } catch {
      setSearchResults([]);
    }
    setSearching(false);
  };

  const nextStep = () => {
    if (step === 2 && path === 'new') {
      if (!stageName || !djType) return setError('Stage name and type are required');
      if (selectedGenres.length === 0) return setError('Select at least one genre');
    }
    if (step === 2 && path === 'claim') {
      if (!claimId) return setError('Please select a profile to claim');
    }
    if (step === 3) {
      if (!email || !password) return setError('Email and password are required');
      if (password !== confirmPassword) return setError('Passwords do not match');
      if (password.length < 8) return setError('Password must be at least 8 characters');
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!email || !password) return setError('Email and password are required');
    if (password !== confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    setError('');
    try {
      const body: Record<string, unknown> = {
        email,
        password,
        phone: phone || undefined,
      };

      if (path === 'new') {
        body.stageName = stageName;
        body.type = djType;
        body.genres = selectedGenres;
        body.bio = bio || undefined;
        body.instagram = instagram || undefined;
      } else {
        body.claimProfileId = claimId;
      }

      await authPost('/auth/dj/register', body);
      setDone(true);
    } catch (e: any) {
      setError(e?.message || 'Registration failed');
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-bg ml-0 !ml-0">
        <div className="w-full max-w-[440px] mx-auto p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-live/20 mx-auto flex items-center justify-center text-[28px] mb-4">
            ✅
          </div>
          <h1 className="text-2xl font-extrabold mb-2">Registration Submitted!</h1>
          <p className="text-ink-mute text-sm mb-6">
            Your DJ profile {path === 'claim' ? `claim for ${claimName}` : `for ${stageName}`} is under review.
            We&apos;ll notify you at <span className="text-ink font-semibold">{email}</span> once approved.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded-xl bg-neon text-white text-sm font-bold hover:brightness-110 transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-bg ml-0 !ml-0 overflow-y-auto py-8">
      <div className="w-full max-w-[480px] mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight">
            BAR<span className="text-neon">BLINK</span> DJ
          </h1>
          <p className="text-ink-mute text-sm mt-1">Register as a DJ</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                s <= step ? 'bg-neon text-white' : 'bg-elevated text-ink-faint'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 ${s < step ? 'bg-neon' : 'bg-elevated'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-surface rounded-2xl border border-white/[0.06] p-6">
          {/* Step 1: Choose path */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-bold mb-4">How would you like to register?</h2>
              <div className="space-y-3">
                <button
                  onClick={() => { setPath('new'); setStep(2); setError(''); }}
                  className="w-full p-4 rounded-xl bg-elevated border border-white/[0.06] hover:border-neon-border text-left transition group"
                >
                  <p className="font-bold group-hover:text-neon transition">I&apos;m new to Barblink</p>
                  <p className="text-ink-mute text-xs mt-1">Create a fresh DJ profile from scratch</p>
                </button>
                <button
                  onClick={() => { setPath('claim'); setStep(2); setError(''); }}
                  className="w-full p-4 rounded-xl bg-elevated border border-white/[0.06] hover:border-neon-border text-left transition group"
                >
                  <p className="font-bold group-hover:text-neon transition">Claim my profile</p>
                  <p className="text-ink-mute text-xs mt-1">I already have a profile on Barblink (added by a venue)</p>
                </button>
              </div>
            </>
          )}

          {/* Step 2a: New DJ */}
          {step === 2 && path === 'new' && (
            <>
              <h2 className="text-lg font-bold mb-4">Your DJ Profile</h2>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Stage Name *</label>
              <input type="text" value={stageName} onChange={(e) => setStageName(e.target.value)} placeholder="e.g. DJ Nova"
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />

              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Type *</label>
              <select value={djType} onChange={(e) => setDjType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4">
                <option value="">Select type</option>
                {DJ_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>

              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Genres *</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {GENRES.map((g) => (
                  <button key={g} onClick={() => toggleGenre(g)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedGenres.includes(g)
                        ? 'bg-neon text-white'
                        : 'bg-elevated text-ink-mute hover:text-ink'
                    }`}>
                    {g}
                  </button>
                ))}
              </div>

              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell us about yourself..."
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4 resize-none" />

              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Instagram</label>
              <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/djnova"
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />
            </>
          )}

          {/* Step 2b: Claim profile */}
          {step === 2 && path === 'claim' && (
            <>
              <h2 className="text-lg font-bold mb-4">Find Your Profile</h2>
              <div className="flex gap-2 mb-4">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by stage name..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition" />
                <button onClick={handleSearch} disabled={searching}
                  className="px-4 py-3 rounded-xl bg-neon text-white text-sm font-bold disabled:opacity-40 hover:brightness-110 transition">
                  {searching ? '...' : 'Search'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2 mb-4">
                  {searchResults.map((r) => (
                    <button key={r.id}
                      onClick={() => { setClaimId(r.id); setClaimName(r.stageName); }}
                      className={`w-full p-3 rounded-xl border text-left transition ${
                        claimId === r.id
                          ? 'bg-neon-ghost border-neon-border'
                          : 'bg-elevated border-white/[0.06] hover:border-neon-border'
                      }`}>
                      <p className="font-bold text-sm">{r.stageName}</p>
                      <p className="text-ink-mute text-xs">{r.type} &middot; {r.genres.join(', ')}</p>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.length === 0 && searchQuery && !searching && (
                <p className="text-ink-faint text-xs mb-4">No profiles found. Try a different search or register as new.</p>
              )}
            </>
          )}

          {/* Step 3: Account */}
          {step === 3 && (
            <>
              <h2 className="text-lg font-bold mb-4">Create Your Account</h2>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com"
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />

              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Password *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters"
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />

              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Confirm Password *</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password"
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />

              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+60 12 345 6789"
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />
            </>
          )}

          {error && <p className="text-danger text-xs mb-3">{error}</p>}

          <div className="flex gap-3">
            {step > 1 && (
              <button onClick={() => { setStep(step === 2 ? 1 : step - 1); setError(''); }}
                className="flex-1 py-3 rounded-xl bg-elevated text-ink-mute text-sm font-bold hover:bg-white/[0.06] transition">
                Back
              </button>
            )}
            {step === 2 && (
              <button onClick={nextStep}
                className="flex-1 py-3 rounded-xl bg-neon text-white text-sm font-bold hover:brightness-110 transition">
                Continue
              </button>
            )}
            {step === 3 && (
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 py-3 rounded-xl bg-neon text-white text-sm font-bold disabled:opacity-40 hover:brightness-110 transition">
                {loading ? 'Submitting...' : 'Submit Registration'}
              </button>
            )}
          </div>

          <p className="text-ink-faint text-[11px] text-center mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-neon hover:text-neon-bright transition">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
