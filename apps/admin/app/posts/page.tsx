'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/components/AdminAuthProvider';
import { socialGet, socialDelete } from '@/lib/api';

interface Post {
  id: string;
  userId: string;
  venueId: string | null;
  caption: string | null;
  isActive: boolean;
  createdAt: string;
  likeCount: number;
  commentCount: number;
}

interface PostList { items: Post[]; total: number; page: number; totalPages: number }

export default function PostsPage() {
  const { token } = useAdminAuth();
  const [data, setData] = useState<PostList | null>(null);
  const [page, setPage] = useState(1);

  const fetch = () => {
    if (!token) return;
    socialGet<PostList>(`/admin/posts?page=${page}&limit=20`, token).then(setData).catch(() => {});
  };

  useEffect(fetch, [token, page]);

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Delete this post?')) return;
    await socialDelete(`/admin/posts/${id}`, token);
    fetch();
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">Posts</h1>
      <p className="text-ink-mute text-sm mb-6">{data?.total ?? 0} total posts</p>

      <div className="bg-surface rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Caption</th>
              <th>Likes</th>
              <th>Comments</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((p) => (
              <tr key={p.id}>
                <td className="max-w-[300px] truncate">{p.caption || '(no caption)'}</td>
                <td className="text-ink-mute">❤️ {p.likeCount}</td>
                <td className="text-ink-mute">💬 {p.commentCount}</td>
                <td>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${p.isActive ? 'bg-live/20 text-live' : 'bg-danger/20 text-danger'}`}>
                    {p.isActive ? 'active' : 'deleted'}
                  </span>
                </td>
                <td className="text-ink-mute text-sm">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td>
                  {p.isActive && (
                    <button onClick={() => handleDelete(p.id)} className="text-danger text-xs font-semibold hover:underline">
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(data?.items || []).length === 0 && (
          <div className="py-12 text-center text-ink-faint text-sm">No posts yet</div>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex gap-2 mt-4 justify-center">
          {Array.from({ length: data.totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded-lg text-sm ${page === i + 1 ? 'bg-neon text-white' : 'bg-surface text-ink-mute hover:text-ink'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
