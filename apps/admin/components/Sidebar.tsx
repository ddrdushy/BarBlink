'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from './AdminAuthProvider';

const NAV = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/venues', label: 'Venues', icon: '🏪' },
  { href: '/users', label: 'Users', icon: '👥' },
  { href: '/posts', label: 'Posts', icon: '📝' },
  { href: '/checkins', label: 'Check-ins', icon: '📍' },
  { href: '/djs', label: 'DJs & Bands', icon: '🎧' },
  { href: '/events', label: 'Events', icon: '🎉' },
  { href: '/scraper', label: 'Scraper', icon: '🤖' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  if (pathname === '/login') return null;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-surface border-r border-white/[0.06] flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon to-neon-dim flex items-center justify-center text-sm">
            🦉
          </div>
          <div>
            <span className="font-extrabold text-[15px] tracking-tight">
              BAR<span className="text-neon">BLINK</span>
            </span>
            <span className="block text-[10px] text-ink-faint tracking-widest">ADMIN</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        {NAV.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition mb-1 ${
                active
                  ? 'bg-neon-ghost text-neon-bright'
                  : 'text-ink-mute hover:text-ink hover:bg-white/[0.04]'
              }`}
            >
              <span className="text-[16px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-ink-faint hover:text-danger hover:bg-white/[0.04] transition"
        >
          <span className="text-[16px]">🚪</span>
          Log out
        </button>
      </div>
    </aside>
  );
}
