import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Barblink - KL Nightlife',
  description: 'Discover the best nightlife in Kuala Lumpur',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-ink font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
