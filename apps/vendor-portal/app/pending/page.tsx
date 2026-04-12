'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PendingPage() {
  const [vendor, setVendor] = useState<{ businessName?: string; createdAt?: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('bbk_vendor_pending');
    if (stored) {
      try { setVendor(JSON.parse(stored)); } catch {}
    }
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-bg ml-0 !ml-0">
      <div className="w-full max-w-[440px] mx-auto p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-amber/20 mx-auto flex items-center justify-center text-[28px] mb-4">
          ⏳
        </div>
        <h1 className="text-2xl font-extrabold mb-2">Application Under Review</h1>
        {vendor?.businessName && (
          <p className="text-neon font-semibold text-lg mb-2">{vendor.businessName}</p>
        )}
        <p className="text-ink-mute text-sm mb-4 leading-relaxed">
          Your venue registration is being reviewed by our team. This usually takes 1-2 business days.
          We&apos;ll send you an email once your application is approved.
        </p>
        {vendor?.createdAt && (
          <p className="text-ink-faint text-xs mb-4">
            Submitted: {new Date(vendor.createdAt).toLocaleDateString()}
          </p>
        )}
        <p className="text-ink-faint text-xs mb-6">
          Questions? Contact us at <span className="text-neon">support@barblink.com</span>
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 rounded-xl bg-elevated text-ink-mute text-sm font-bold hover:bg-white/[0.06] transition"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
