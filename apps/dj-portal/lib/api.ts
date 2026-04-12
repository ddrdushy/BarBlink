const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API || 'http://localhost:3001/v1';
const DJ_API = process.env.NEXT_PUBLIC_DJ_API || 'http://localhost:3010/v1';

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

// DJ service
export const djGet = <T>(path: string, token: string) =>
  apiFetch<T>(DJ_API, path, { token });
export const djPut = <T>(path: string, body: Record<string, unknown>, token: string) =>
  apiFetch<T>(DJ_API, path, { method: 'PUT', body, token });
export const djPost = <T>(path: string, body: Record<string, unknown>, token: string) =>
  apiFetch<T>(DJ_API, path, { method: 'POST', body, token });
