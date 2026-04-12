'use client';

import { useEffect, useState } from 'react';
import { useVendorAuth } from '@/components/VendorAuthProvider';
import { venueGet } from '@/lib/api';

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

export default function ReviewsPage() {
  const { token } = useVendorAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const data = await venueGet<{ reviews: Review[] }>('/vendor/venue/reviews', token);
        setReviews(data.reviews || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, [token]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Reviews</h1>
        <p className="text-ink-mute text-sm mt-1">See what your guests are saying</p>
      </div>

      <div className="bg-surface rounded-2xl border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-ink-mute">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-ink-mute">No reviews yet</div>
        ) : (
          <table className="portal-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium">{r.userName}</td>
                  <td><Stars rating={r.rating} /></td>
                  <td className="text-ink-mute max-w-[300px] truncate">{r.comment || '-'}</td>
                  <td className="text-ink-faint text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
