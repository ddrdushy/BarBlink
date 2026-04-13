import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import { apiPost } from '@/lib/api';

// SecureStore doesn't work on web — use localStorage as fallback
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    const SecureStore = await import('expo-secure-store');
    return storage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    const SecureStore = await import('expo-secure-store');
    await storage.setItem(key, value);
  },
  deleteItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    const SecureStore = await import('expo-secure-store');
    await storage.deleteItem(key);
  },
};

const KEYS = {
  access: 'bbk_access_token',
  refresh: 'bbk_refresh_token',
  user: 'bbk_user',
} as const;

export interface AuthUser {
  id: string;
  phone: string;
  email: string;
  phoneVerified: boolean;
  dateOfBirth: string;
  status: string;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: try to restore session from SecureStore
  useEffect(() => {
    (async () => {
      try {
        const refreshToken = await storage.getItem(KEYS.refresh);
        if (!refreshToken) {
          setIsLoading(false);
          return;
        }

        // Try refreshing the token
        const result = await apiPost<{ accessToken: string; refreshToken: string }>(
          '/auth/refresh',
          { refreshToken },
        );

        // Restore user from storage
        const storedUser = await storage.getItem(KEYS.user);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        setToken(result.accessToken);
        await storage.setItem(KEYS.access, result.accessToken);
        await storage.setItem(KEYS.refresh, result.refreshToken);
      } catch {
        // Token expired or invalid — clear everything
        await storage.deleteItem(KEYS.access);
        await storage.deleteItem(KEYS.refresh);
        await storage.deleteItem(KEYS.user);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(
    async (accessToken: string, refreshToken: string, authUser: AuthUser) => {
      setToken(accessToken);
      setUser(authUser);
      await storage.setItem(KEYS.access, accessToken);
      await storage.setItem(KEYS.refresh, refreshToken);
      await storage.setItem(KEYS.user, JSON.stringify(authUser));
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      const refreshToken = await storage.getItem(KEYS.refresh);
      if (refreshToken && token) {
        await apiPost('/auth/logout', { refreshToken }, token);
      }
    } catch {
      // Ignore logout errors
    }
    setToken(null);
    setUser(null);
    await storage.deleteItem(KEYS.access);
    await storage.deleteItem(KEYS.refresh);
    await storage.deleteItem(KEYS.user);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
