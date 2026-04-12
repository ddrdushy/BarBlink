'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from './AdminAuthProvider';

const NAV_SECTIONS = [
  {
    label: 'OVERVIEW',
    items: [
      { href: '/', label: 'Dashboard', icon: '📊' },
      { href: '/analytics', label: 'Analytics', icon: '📈' },
    ],
  },
  {
    label: 'CONTENT',
    items: [
      { href: '/venues', label: 'Venues', icon: '🏛️' },
      { href: '/djs', label: 'DJs & Bands', icon: '🎵' },
      { href: '/events', label: 'Events', icon: '📅' },
      { href: '/posts', label: 'Posts', icon: '📸' },
      { href: '/checkins', label: 'Check-ins', icon: '✅' },
    ],
  },
  {
    label: 'COMMUNITY',
    items: [
      { href: '/users', label: 'Users', icon: '👥' },
      { href: '/reports', label: 'Reports', icon: '🚩', badge: true },
      { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    ],
  },
  {
    label: 'REGISTRATIONS',
    items: [
      { href: '/vendor-applications', label: 'Vendor Apps', icon: '🏛️', badge: true },
      { href: '/dj-applications', label: 'DJ Apps', icon: '🎵', badge: true },
    ],
  },
  {
    label: 'PLATFORM',
    items: [
      { href: '/scraper', label: 'Scraper Status', icon: '🔄', badge: true },
      { href: '/waitlist', label: 'Waitlist', icon: '📧' },
      { href: '/settings', label: 'Settings', icon: '⚙️' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  if (pathname === '/login') return null;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-[#111114] border-r border-white/[0.06] flex flex-col z-50 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon to-neon-dim flex items-center justify-center text-sm">
            🦉
          </div>
          <div>
            <span className="font-extrabold text-[15px] tracking-tight">
              BAR<span className="text-neon">BLINK</span>
            </span>
            <span className="block text-[9px] text-ink-faint tracking-[0.2em] font-semibold">ADMIN</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">
            <div className="px-3 mb-2 text-[10px] font-bold tracking-[0.15em] text-ink-faint/60">
              {section.label}
            </div>
            {section.items.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition mb-0.5 ${
                    active
                      ? 'bg-neon-ghost text-neon-bright'
                      : 'text-ink-mute hover:text-ink hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="text-[14px] w-5 text-center">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-ink-faint hover:text-danger hover:bg-white/[0.03] transition"
        >
          <span className="text-[14px] w-5 text-center">🚪</span>
          Log out
        </button>
      </div>
    </aside>
  );
}
