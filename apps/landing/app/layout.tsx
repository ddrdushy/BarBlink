import type { Metadata, Viewport } from 'next';
import { Inter, Syne } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
});

export const viewport: Viewport = {
  themeColor: '#0D0D0F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://barblink.com'),
  title: {
    default: "Barblink — Blink, You're In.",
    template: '%s · Barblink',
  },
  description:
    "The nightlife social app for Kuala Lumpur and Colombo. Discover bars and clubs, follow your favourite DJs, and track your crew — all in one place.",
  keywords: [
    'Kuala Lumpur nightlife',
    'KL bars',
    'KL clubs',
    'DJ tonight KL',
    'nightlife app Malaysia',
    'Colombo nightlife',
    'Sri Lanka bars',
    'nightlife app Asia',
    'bar buddy',
    'Barblink',
  ],
  authors: [{ name: 'Barblink' }],
  openGraph: {
    title: "Barblink — Blink, You're In.",
    description:
      "The nightlife social app for KL & Colombo. Bars, DJs, crowds, and your crew — all in one blink.",
    url: 'https://barblink.com',
    siteName: 'Barblink',
    locale: 'en',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Barblink — Blink, You\'re In.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Barblink — Blink, You're In.",
    description: "The nightlife social app for KL & Colombo. Bars, DJs, crowds, and your crew.",
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`}>
      <body className="bg-bg text-ink font-body antialiased">
        {children}
      </body>
    </html>
  );
}
