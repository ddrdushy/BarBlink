import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Expo Go on a physical device: use the dev server host IP (same machine running Metro)
// iOS Simulator: localhost works
// Android Emulator: 10.0.2.2 maps to host
function getDevHost(): string {
  const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (debuggerHost) {
    return debuggerHost.split(':')[0]; // strip Metro port
  }
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

const DEV_HOST = getDevHost();

export const AUTH_API = process.env.EXPO_PUBLIC_AUTH_API || `http://${DEV_HOST}:3001/v1`;
export const USER_API = process.env.EXPO_PUBLIC_USER_API || `http://${DEV_HOST}:3002/v1`;
export const VENUE_API = process.env.EXPO_PUBLIC_VENUE_API || `http://${DEV_HOST}:3003/v1`;

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { statusCode: number; message: string } | null;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(
  baseUrl: string,
  path: string,
  options: { method: string; body?: Record<string, unknown>; token?: string },
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (e: unknown) {
    clearTimeout(timeout);
    if (e instanceof Error && e.name === 'AbortError') {
      throw new ApiError(0, 'Request timed out. Check your connection.');
    }
    throw new ApiError(0, 'Network error. Is the server running?');
  }
  clearTimeout(timeout);

  const json: ApiResponse<T> = await res.json();

  if (!json.success || !json.data) {
    throw new ApiError(
      json.error?.statusCode || res.status,
      json.error?.message || 'Something went wrong',
    );
  }

  return json.data;
}

export function apiPost<T>(path: string, body: Record<string, unknown>, token?: string): Promise<T> {
  return apiFetch<T>(AUTH_API, path, { method: 'POST', body, token });
}

export function userPost<T>(path: string, body: Record<string, unknown>, token: string): Promise<T> {
  return apiFetch<T>(USER_API, path, { method: 'POST', body, token });
}

export function userGet<T>(path: string, token: string): Promise<T> {
  return apiFetch<T>(USER_API, path, { method: 'GET', token });
}

export function userPut<T>(path: string, body: Record<string, unknown>, token: string): Promise<T> {
  return apiFetch<T>(USER_API, path, { method: 'PUT', body, token });
}

export function venueGet<T>(path: string): Promise<T> {
  return apiFetch<T>(VENUE_API, path, { method: 'GET' });
}
