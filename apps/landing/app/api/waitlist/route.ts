import { NextResponse } from 'next/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Save to auth-service waitlist (primary store)
    const authApi = process.env.AUTH_API_URL;
    if (authApi) {
      try {
        await fetch(`${authApi}/waitlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source: 'landing_page' }),
          cache: 'no-store',
        });
      } catch (err) {
        console.error('[waitlist] auth-service call failed', err);
      }
    }

    // Also notify via notification-service (legacy path)
    const apiUrl = process.env.API_URL;
    if (apiUrl) {
      try {
        await fetch(`${apiUrl}/notifications/waitlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source: 'landing_page' }),
          cache: 'no-store',
        });
      } catch (err) {
        console.error('[waitlist] notification-service call failed', err);
      }
    }

    if (!authApi && !apiUrl) {
      console.info('[waitlist] queued (no API URLs set)', email);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
