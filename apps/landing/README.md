# Barblink Landing Page

The marketing + waitlist site for **Barblink** — KL's nightlife social app.
Hosted at [barblink.com](https://barblink.com).

## Stack
- Next.js 14 (App Router)
- TypeScript (strict)
- Tailwind CSS
- Framer Motion
- Google Fonts (Syne + Inter)

## Dev
```bash
cd apps/landing
pnpm install
pnpm dev        # http://localhost:3100
```

## Env
Copy `.env.example` → `.env.local`. `API_URL` is optional locally — without it
waitlist submissions log to the console instead of calling the
notification-service.

## Structure
```
app/
  layout.tsx        Fonts, metadata, global CSS
  page.tsx          Section composition
  globals.css       Tailwind + design system
  api/waitlist/     POST proxy → notification-service
components/
  Navbar.tsx
  Hero.tsx + ParticleCanvas.tsx
  LiveTonight.tsx     Live marquee of KL venues
  FomoHook.tsx        "Group chat is dead" problem section
  Features.tsx        6-card feature grid
  BlinkFeedSection    Phone mockup of the feed
  DjDiscovery         DJ card stack
  CrowdMeterDemo      Live crowd bars for KL
  Passport            Nightlife map + badges
  Voices              Testimonials
  Faq                 Common questions
  Waitlist            Email capture
  Footer
```

## Design rules
- Background: `#0D0D0F`
- Accent: `#C45AFF` (neon purple)
- Dark only. Nightlife energy, not corporate SaaS.
- Minimum 48px touch targets on interactive elements.
