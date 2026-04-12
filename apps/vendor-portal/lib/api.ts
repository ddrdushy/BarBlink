const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API || 'http://localhost:3001/v1';
const VENUE_API = process.env.NEXT_PUBLIC_VENUE_API || 'http://localhost:3003/v1';

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
export const authPost = <T>(path: string, body: Record<string, unknown>, token?: string) =>
  apiFetch<T>(AUTH_API, path, { method: 'POST', body, token });

// Venue service
export const venueGet = <T>(path: string, token: string) =>
  apiFetch<T>(VENUE_API, path, { token });
export const venuePut = <T>(path: string, body: Record<string, unknown>, token: string) =>
  apiFetch<T>(VENUE_API, path, { method: 'PUT', body, token });
