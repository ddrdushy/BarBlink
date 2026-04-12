'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface VendorAuth {
  token: string | null;
  setToken: (t: string | null) => void;
  logout: () => void;
}

const Ctx = createContext<VendorAuth>({ token: null, setToken: () => {}, logout: () => {} });

export function useVendorAuth() {
  return useContext(Ctx);
}

const PUBLIC_PATHS = ['/login', '/register', '/pending'];

export function VendorAuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('bbk_vendor_token');
    if (stored) setTokenState(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    if (!token && !isPublic) {
      router.replace('/login');
    }
    if (token && pathname === '/login') {
      router.replace('/dashboard');
    }
  }, [ready, token, pathname, router]);

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) localStorage.setItem('bbk_vendor_token', t);
    else localStorage.removeItem('bbk_vendor_token');
  };

  const logout = () => {
    setToken(null);
    router.replace('/login');
  };

  if (!ready) return null;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (!token && !isPublic) return null;

  return (
    <Ctx.Provider value={{ token, setToken, logout }}>
      {children}
    </Ctx.Provider>
  );
}
