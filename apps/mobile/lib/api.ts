import { Platform } from 'react-native';

// Android emulator uses 10.0.2.2 to reach host, iOS sim uses localhost
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const AUTH_API = process.env.EXPO_PUBLIC_AUTH_API || `http://${DEV_HOST}:3001/v1`;
export const USER_API = process.env.EXPO_PUBLIC_USER_API || `http://${DEV_HOST}:3002/v1`;

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

  const res = await fetch(`${baseUrl}${path}`, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

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
