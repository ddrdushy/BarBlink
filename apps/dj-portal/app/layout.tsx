import type { Metadata } from 'next';
import './globals.css';
import { DjAuthProvider } from '@/components/DjAuthProvider';
import { DjSidebar } from '@/components/DjSidebar';

export const metadata: Metadata = {
  title: 'Barblink DJ Portal',
  description: 'Manage your DJ profile on Barblink',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-ink font-sans antialiased">
        <DjAuthProvider>
          <DjSidebar />
          <main className="ml-0 min-[768px]:ml-[240px] min-h-screen p-6 md:p-8">
            {children}
          </main>
        </DjAuthProvider>
      </body>
    </html>
  );
}
