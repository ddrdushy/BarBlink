import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiPost } from '@/lib/api';

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
        const refreshToken = await SecureStore.getItemAsync(KEYS.refresh);
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
        const storedUser = await SecureStore.getItemAsync(KEYS.user);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        setToken(result.accessToken);
        await SecureStore.setItemAsync(KEYS.access, result.accessToken);
        await SecureStore.setItemAsync(KEYS.refresh, result.refreshToken);
      } catch {
        // Token expired or invalid — clear everything
        await SecureStore.deleteItemAsync(KEYS.access);
        await SecureStore.deleteItemAsync(KEYS.refresh);
        await SecureStore.deleteItemAsync(KEYS.user);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(
    async (accessToken: string, refreshToken: string, authUser: AuthUser) => {
      setToken(accessToken);
      setUser(authUser);
      await SecureStore.setItemAsync(KEYS.access, accessToken);
      await SecureStore.setItemAsync(KEYS.refresh, refreshToken);
      await SecureStore.setItemAsync(KEYS.user, JSON.stringify(authUser));
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync(KEYS.refresh);
      if (refreshToken && token) {
        await apiPost('/auth/logout', { refreshToken }, token);
      }
    } catch {
      // Ignore logout errors
    }
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync(KEYS.access);
    await SecureStore.deleteItemAsync(KEYS.refresh);
    await SecureStore.deleteItemAsync(KEYS.user);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
