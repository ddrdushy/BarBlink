import type { Metadata } from 'next';
import './globals.css';
import { VendorAuthProvider } from '@/components/VendorAuthProvider';
import { VendorSidebar } from '@/components/VendorSidebar';

export const metadata: Metadata = {
  title: 'Barblink Vendor Portal',
  description: 'Manage your venue on Barblink',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-ink font-sans antialiased">
        <VendorAuthProvider>
          <VendorSidebar />
          <main className="ml-0 min-[768px]:ml-[240px] min-h-screen p-6 md:p-8">
            {children}
          </main>
        </VendorAuthProvider>
      </body>
    </html>
  );
}
