import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AdminAuthProvider } from '@/components/AdminAuthProvider';
import { Sidebar } from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Barblink Admin',
  description: 'Barblink platform administration',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-bg text-ink font-sans antialiased">
        <AdminAuthProvider>
          <Sidebar />
          <main className="ml-0 min-[768px]:ml-[240px] min-h-screen p-6 md:p-8">
            {children}
          </main>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
