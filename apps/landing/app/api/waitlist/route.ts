import { NextResponse } from 'next/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

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
    } else {
      console.info('[waitlist] queued (no API_URL set)', email);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
