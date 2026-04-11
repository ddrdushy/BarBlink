'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface AdminAuth {
  token: string | null;
  setToken: (t: string | null) => void;
  logout: () => void;
}

const Ctx = createContext<AdminAuth>({ token: null, setToken: () => {}, logout: () => {} });

export function useAdminAuth() {
  return useContext(Ctx);
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('bbk_admin_token');
    if (stored) setTokenState(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!token && pathname !== '/login') {
      router.replace('/login');
    }
    if (token && pathname === '/login') {
      router.replace('/');
    }
  }, [ready, token, pathname, router]);

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) localStorage.setItem('bbk_admin_token', t);
    else localStorage.removeItem('bbk_admin_token');
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('bbk_admin_refresh');
    router.replace('/login');
  };

  if (!ready) return null;
  if (!token && pathname !== '/login') return null;

  return (
    <Ctx.Provider value={{ token, setToken, logout }}>
      {children}
    </Ctx.Provider>
  );
}
