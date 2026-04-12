'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDjAuth } from './DjAuthProvider';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/profile', label: 'My Profile', icon: '🎵' },
  { href: '/events', label: 'Events', icon: '📅' },
  { href: '/ratings', label: 'Ratings', icon: '⭐' },
  { href: '/setlists', label: 'Setlists', icon: '🎶' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export function DjSidebar() {
  const pathname = usePathname();
  const { logout } = useDjAuth();

  const hideSidebar = ['/login', '/register', '/pending'].some((p) => pathname.startsWith(p));
  if (hideSidebar) return null;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-[#111114] border-r border-white/[0.06] flex flex-col z-50 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon to-neon-dim flex items-center justify-center text-sm">
            🎵
          </div>
          <div>
            <span className="font-extrabold text-[15px] tracking-tight">
              BAR<span className="text-neon">BLINK</span>
            </span>
            <span className="block text-[9px] text-ink-faint tracking-[0.2em] font-semibold">DJ PORTAL</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3">
        <div className="px-3 mb-2 text-[10px] font-bold tracking-[0.15em] text-ink-faint/60">
          MANAGE
        </div>
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
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
            </Link>
          );
        })}
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
