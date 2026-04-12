'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDjAuth } from '@/components/DjAuthProvider';
import { authPost } from '@/lib/api';

export default function LoginPage() {
  const { setToken } = useDjAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authPost<{
        accessToken: string;
        dj: { id: string; stageName: string; status: string };
      }>('/auth/dj/login', { email, password });

      if (res.dj.status === 'pending') {
        localStorage.setItem('bbk_dj_pending', JSON.stringify(res.dj));
        router.push('/pending');
        return;
      }

      if (res.dj.status === 'suspended') {
        setError('Your account has been suspended. Please contact support.');
        return;
      }

      localStorage.setItem('bbk_dj_name', res.dj.stageName);
      setToken(res.accessToken);
    } catch (e: any) {
      setError(e?.message || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-bg ml-0 !ml-0">
      <div className="w-full max-w-[400px] mx-auto p-8">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon to-neon-dim mx-auto flex items-center justify-center text-[28px] mb-4">
            🎵
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            BAR<span className="text-neon">BLINK</span> DJ
          </h1>
          <p className="text-ink-mute text-sm mt-1">DJ management portal</p>
        </div>

        <div className="bg-surface rounded-2xl border border-white/[0.06] p-6">
          <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4"
          />

          <label className="block text-[11px] font-bold tracking-wider uppercase text-ink-mute mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 rounded-xl bg-elevated border border-white/[0.06] text-ink text-sm font-medium outline-none focus:border-neon/60 transition mb-4"
          />

          {error && <p className="text-danger text-xs mb-3">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={!email || !password || loading}
            className="w-full py-3 rounded-xl bg-neon text-white text-sm font-bold disabled:opacity-40 hover:brightness-110 transition"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-ink-faint text-[11px] text-center mt-4">
            New here?{' '}
            <Link href="/register" className="text-neon hover:text-neon-bright transition">
              Register as a DJ &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
