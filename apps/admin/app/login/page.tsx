'use client';

import { useState } from 'react';
import { useAdminAuth } from '@/components/AdminAuthProvider';
import { authPost } from '@/lib/api';

export default function LoginPage() {
  const { setToken } = useAdminAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await authPost('/auth/send-otp', { phone: `+60${phone}` });
      setStep('otp');
    } catch (e: any) {
      setError(e?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authPost<{ accessToken: string; refreshToken: string }>(
        '/auth/verify-otp',
        { phone: `+60${phone}`, code },
      );
      localStorage.setItem('bbk_admin_refresh', res.refreshToken);
      setToken(res.accessToken);
    } catch (e: any) {
      setError(e?.message || 'Invalid OTP');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-bg ml-0 !ml-0">
      <div className="w-full max-w-[400px] mx-auto p-8">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon to-neon-dim mx-auto flex items-center justify-center text-[28px] mb-4">
            🦉
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            BAR<span className="text-neon">BLINK</span> ADMIN
          </h1>
          <p className="text-ink-mute text-sm mt-1">Platform control centre</p>
        </div>

        <div className="bg-surface rounded-2xl border border-white/[0.06] p-6">
          {step === 'phone' ? (
            <>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">
                Phone number
              </label>
              <div className="flex gap-2 mb-4">
                <div className="px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink-mute text-sm font-semibold">
                  +60
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000000"
                  className="flex-1 px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition"
                />
              </div>
              {error && <p className="text-danger text-xs mb-3">{error}</p>}
              <button
                onClick={handleSendOtp}
                disabled={phone.length < 7 || loading}
                className="w-full py-3 rounded-xl bg-neon text-white text-sm font-bold disabled:opacity-40 hover:brightness-110 transition"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </>
          ) : (
            <>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">
                Verification code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-lg font-bold tracking-[0.3em] text-center outline-none focus:border-neon/60 transition mb-4"
              />
              {error && <p className="text-danger text-xs mb-3">{error}</p>}
              <button
                onClick={handleVerify}
                disabled={code.length !== 6 || loading}
                className="w-full py-3 rounded-xl bg-neon text-white text-sm font-bold disabled:opacity-40 hover:brightness-110 transition"
              >
                {loading ? 'Verifying...' : 'Log in'}
              </button>
              <button
                onClick={() => { setStep('phone'); setCode(''); setError(''); }}
                className="w-full mt-2 py-2 text-ink-mute text-xs hover:text-ink transition"
              >
                Use a different number
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
