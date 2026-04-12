'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authPost } from '@/lib/api';

const VENUE_TYPES = ['Bar', 'Club', 'Lounge', 'Pub', 'Rooftop', 'Speakeasy', 'Beer Garden', 'Wine Bar', 'Cocktail Bar', 'Other'];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // Step 1: Account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Business
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [venueType, setVenueType] = useState('');
  const [address, setAddress] = useState('');

  // Step 3: Online
  const [instagram, setInstagram] = useState('');
  const [website, setWebsite] = useState('');

  // Step 4: Note
  const [note, setNote] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const nextStep = () => {
    if (step === 1) {
      if (!email || !password) return setError('Email and password are required');
      if (password !== confirmPassword) return setError('Passwords do not match');
      if (password.length < 8) return setError('Password must be at least 8 characters');
    }
    if (step === 2) {
      if (!businessName || !contactName || !venueType || !address) return setError('Please fill in all required fields');
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!agreeTerms) return setError('You must agree to the terms and conditions');
    setLoading(true);
    setError('');
    try {
      await authPost('/auth/vendor/register', {
        email,
        password,
        businessName,
        contactName,
        phone,
        venueType,
        address,
        instagram: instagram || undefined,
        website: website || undefined,
        note: note || undefined,
      });
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
          <h1 className="text-2xl font-extrabold mb-2">Application Submitted!</h1>
          <p className="text-ink-mute text-sm mb-6">
            Your venue registration for <span className="text-ink font-semibold">{businessName}</span> is under review.
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
            BAR<span className="text-neon">BLINK</span> VENUE
          </h1>
          <p className="text-ink-mute text-sm mt-1">Register your venue</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                s <= step ? 'bg-neon text-white' : 'bg-elevated text-ink-faint'
              }`}>
                {s}
              </div>
              {s < 4 && <div className={`flex-1 h-0.5 ${s < step ? 'bg-neon' : 'bg-elevated'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-surface rounded-2xl border border-white/[0.06] p-6">
          {/* Step 1: Account */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-bold mb-4">Account Details</h2>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourvenue.com"
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />
              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters"
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />
              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password"
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />
            </>
          )}

          {/* Step 2: Business */}
          {step === 2 && (
            <>
              <h2 className="text-lg font-bold mb-4">Business Information</h2>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Venue Name *</label>
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Skybar KL"
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />
              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Contact Person *</label>
              <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Full name"
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />
              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+60 12 345 6789"
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />
              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Venue Type *</label>
              <select value={venueType} onChange={(e) => setVenueType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4">
                <option value="">Select type</option>
                {VENUE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Address *</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address"
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />
            </>
          )}

          {/* Step 3: Online */}
          {step === 3 && (
            <>
              <h2 className="text-lg font-bold mb-4">Online Presence</h2>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Instagram URL</label>
              <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/yourvenue"
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />
              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Website</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourvenue.com"
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4" />
              <p className="text-ink-faint text-xs">These help us verify your venue. Optional but recommended.</p>
            </>
          )}

          {/* Step 4: Note */}
          {step === 4 && (
            <>
              <h2 className="text-lg font-bold mb-4">Additional Info</h2>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">Note to Barblink Team</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything you'd like us to know..."
                rows={4} className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4 resize-none" />
              <label className="flex items-start gap-3 cursor-pointer mb-4">
                <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 accent-neon" />
                <span className="text-ink-mute text-xs leading-relaxed">
                  I agree to the Barblink Terms of Service and Privacy Policy. I confirm that I am authorized to register this venue.
                </span>
              </label>
            </>
          )}

          {error && <p className="text-danger text-xs mb-3">{error}</p>}

          <div className="flex gap-3">
            {step > 1 && (
              <button onClick={() => { setStep(step - 1); setError(''); }}
                className="flex-1 py-3 rounded-xl bg-elevated text-ink-mute text-sm font-bold hover:bg-white/[0.06] transition">
                Back
              </button>
            )}
            {step < 4 ? (
              <button onClick={nextStep}
                className="flex-1 py-3 rounded-xl bg-neon text-white text-sm font-bold hover:brightness-110 transition">
                Continue
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading || !agreeTerms}
                className="flex-1 py-3 rounded-xl bg-neon text-white text-sm font-bold disabled:opacity-40 hover:brightness-110 transition">
                {loading ? 'Submitting...' : 'Submit Application'}
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
