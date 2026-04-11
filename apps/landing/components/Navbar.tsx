'use client';

import { useEffect, useState } from 'react';

const links = [
  { label: 'Features', href: '#features' },
  { label: 'DJs', href: '#djs' },
  { label: 'Feed', href: '#feed' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-strong' : 'bg-transparent'
      }`}
    >
      <div
        className={`container-xl flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'h-[62px]' : 'h-[84px]'
        }`}
      >
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-neon to-[#7A2BBE] flex items-center justify-center text-[16px]">
            🦉
            <span className="absolute inset-0 rounded-full bg-neon/30 blur-lg opacity-0 group-hover:opacity-100 transition" />
          </div>
          <span className="font-display font-extrabold text-[19px] tracking-tighter">
            BAR<span className="text-neon">LINK</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13.5px] font-medium text-ink-mute hover:text-white transition relative group"
            >
              {l.label}
              <span className="absolute -bottom-1.5 left-0 right-0 h-[1.5px] bg-neon scale-x-0 group-hover:scale-x-100 origin-left transition-transform" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="#waitlist" className="hidden sm:inline-flex btn-neon !py-2.5 !px-5 !text-[13px]">
            Get Early Access
          </a>
          <button
            aria-label="Menu"
            onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 rounded-full glass flex items-center justify-center"
          >
            <div className="relative w-4 h-3">
              <span className={`absolute left-0 right-0 h-[1.5px] bg-white transition-all ${open ? 'top-1/2 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 right-0 h-[1.5px] bg-white top-1/2 transition-opacity ${open ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute left-0 right-0 h-[1.5px] bg-white transition-all ${open ? 'top-1/2 -rotate-45' : 'top-full'}`} />
            </div>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden glass-strong border-t border-white/5">
          <div className="container-xl py-5 flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-[15px] font-medium text-ink-mute hover:text-white py-1.5"
              >
                {l.label}
              </a>
            ))}
            <a href="#waitlist" onClick={() => setOpen(false)} className="btn-neon justify-center mt-2">
              Get Early Access
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
