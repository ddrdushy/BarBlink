const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API || 'http://localhost:3001/v1';
const USER_API = process.env.NEXT_PUBLIC_USER_API || 'http://localhost:3002/v1';
const VENUE_API = process.env.NEXT_PUBLIC_VENUE_API || 'http://localhost:3003/v1';
const SOCIAL_API = process.env.NEXT_PUBLIC_SOCIAL_API || 'http://localhost:3005/v1';
const CHECKIN_API = process.env.NEXT_PUBLIC_CHECKIN_API || 'http://localhost:3006/v1';
const DJ_API = process.env.NEXT_PUBLIC_DJ_API || 'http://localhost:3010/v1';
const EVENTS_API = process.env.NEXT_PUBLIC_EVENTS_API || 'http://localhost:3011/v1';
const SCRAPER_API = process.env.NEXT_PUBLIC_SCRAPER_API || 'http://localhost:3009/v1';

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { statusCode: number; message: string } | null;
}

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

async function apiFetch<T>(base: string, path: string, opts: {
  method?: string;
  body?: Record<string, unknown>;
  token?: string;
} = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`;

  const res = await fetch(`${base}${path}`, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success || !json.data) {
    throw new ApiError(json.error?.statusCode || res.status, json.error?.message || 'Error');
  }
  return json.data;
}

// Auth
export const authGet = <T>(path: string, token: string) =>
  apiFetch<T>(AUTH_API, path, { token });
export const authPost = <T>(path: string, body: Record<string, unknown>, token?: string) =>
  apiFetch<T>(AUTH_API, path, { method: 'POST', body, token });

// User service
export const userGet = <T>(path: string, token: string) =>
  apiFetch<T>(USER_API, path, { token });
export const userPut = <T>(path: string, body: Record<string, unknown>, token: string) =>
  apiFetch<T>(USER_API, path, { method: 'PUT', body, token });

// Venue service
export const venueGet = <T>(path: string, token?: string) =>
  apiFetch<T>(VENUE_API, path, { token });
export const venuePost = <T>(path: string, body: Record<string, unknown>, token: string) =>
  apiFetch<T>(VENUE_API, path, { method: 'POST', body, token });
export const venuePut = <T>(path: string, body: Record<string, unknown>, token: string) =>
  apiFetch<T>(VENUE_API, path, { method: 'PUT', body, token });

// Social service
export const socialGet = <T>(path: string, token: string) =>
  apiFetch<T>(SOCIAL_API, path, { token });
export const socialPost = <T>(path: string, body: Record<string, unknown>, token: string) =>
  apiFetch<T>(SOCIAL_API, path, { method: 'POST', body, token });
export const socialPut = <T>(path: string, body: Record<string, unknown>, token: string) =>
  apiFetch<T>(SOCIAL_API, path, { method: 'PUT', body, token });
export const socialDelete = <T>(path: string, token: string) =>
  apiFetch<T>(SOCIAL_API, path, { method: 'DELETE', token });

// Checkin service
export const checkinGet = <T>(path: string, token: string) =>
  apiFetch<T>(CHECKIN_API, path, { token });

// DJ service
export const djGet = <T>(path: string, token?: string) =>
  apiFetch<T>(DJ_API, path, { token });
export const djPost = <T>(path: string, body: Record<string, unknown>, token: string) =>
  apiFetch<T>(DJ_API, path, { method: 'POST', body, token });
export const djPut = <T>(path: string, body: Record<string, unknown>, token: string) =>
  apiFetch<T>(DJ_API, path, { method: 'PUT', body, token });

// Events service
export const eventsGet = <T>(path: string, token?: string) =>
  apiFetch<T>(EVENTS_API, path, { token });
export const eventsPost = <T>(path: string, body: Record<string, unknown>, token: string) =>
  apiFetch<T>(EVENTS_API, path, { method: 'POST', body, token });

// Community service
const COMMUNITY_API = process.env.NEXT_PUBLIC_COMMUNITY_API || 'http://localhost:3012/v1';
export const communityGet = <T>(path: string, token: string) =>
  apiFetch<T>(COMMUNITY_API, path, { token });

// Scraper service
export const scraperGet = <T>(path: string, token: string) =>
  apiFetch<T>(SCRAPER_API, path, { token });
export const scraperPost = <T>(path: string, body: Record<string, unknown>, token: string) =>
  apiFetch<T>(SCRAPER_API, path, { method: 'POST', body, token });

// Settings (via auth-service)
export const settingsGet = <T>(path: string, token: string) =>
  apiFetch<T>(AUTH_API, path, { token });
export const settingsPost = <T>(path: string, body: Record<string, unknown>, token: string) =>
  apiFetch<T>(AUTH_API, path, { method: 'POST', body, token });
export const settingsDelete = <T>(path: string, token: string) =>
  apiFetch<T>(AUTH_API, path, { method: 'DELETE', token });
