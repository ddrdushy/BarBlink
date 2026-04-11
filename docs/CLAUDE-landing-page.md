# Claude Code Instructions — Landing Page (apps/landing)

## Task
Build the Barblink landing page at `apps/landing` using Next.js 14 (App Router).
This is a static marketing site hosted at **barblink.com**.

Read `docs/09-landing-page.md` and `docs/11-brand-guidelines.md` before writing any code.

---

## Stack
- Next.js 14 App Router
- TypeScript
- Tailwind CSS (for utility classes)
- Framer Motion (for animations and scroll reveals)
- No external UI component libraries

---

## Design Reference
The design should feel like **https://mindverse.casethemes.net/home-dark/** in energy and layout quality — dark, animated, premium — but with Barblink's own identity. Do NOT copy MindVerse. Use it only as a quality benchmark.

**Core design rules:**
- Background: `#0D0D0F` everywhere
- Primary accent: `#C45AFF` (neon purple)
- Font: Syne (headings, logo) + Inter (body) — import from Google Fonts
- Dark theme only — no light mode
- Animated particle canvas in hero background (floating white + purple dots, moving upward slowly like bokeh nightlife lights)
- Scroll-triggered reveal animations on every section (Framer Motion `whileInView`)
- Sticky glassmorphism navbar that shrinks on scroll
- NO generic SaaS aesthetics — this is a nightlife app

---

## Sections to Build (in order)

### 1. Navbar
- Left: 🦉 BARBLINK logo (Syne, 800 weight, purple accent on "LINK")
- Center: Nav links — Features | DJs | Social | Get Access
- Right: "Get Early Access" pill button (purple background, white text)
- Sticky, glassmorphism backdrop-filter blur on scroll
- Shrinks padding on scroll (transition)

### 2. Hero (full viewport height)
- Canvas particle animation as background (use `<canvas>` with JavaScript — floating dots, mostly white, ~15% purple, slow upward drift)
- Centered content:
  - Badge pill: green live dot + "Now launching in Kuala Lumpur 🇲🇾"
  - Headline (Syne, 800, ~88px): "Your Night Starts with a **Blink**" — "Blink" in neon purple with animated underline that grows on load
  - Subheadline (Inter, 300, muted): "Discover bars and clubs in KL, follow your favourite DJs, and track your crew — all in one place."
  - Two buttons: "Get Early Access" (purple filled, box-shadow glow) + "See How It Works" (outline)
  - Avatar strip: 5 small overlapping circles (coloured initials) + waitlist count "2,841 people already on the waitlist"
- Scroll indicator at bottom (animated line + "scroll" text)

### 3. Features Grid
- Section label: "WHY BARBLINK" (purple, small caps, letter-spaced)
- Section title: "Everything your night needs"
- 3×2 grid of feature cards:
  - Each card: dark surface (#141418), 1px purple border (low opacity), hover lifts + border glows
  - Cards:
    1. 📍 Live Crowd Meter — "See how packed every bar is right now, updated in real-time from check-ins." Include crowd status tags: 🟢 Quiet / 🟡 Getting Lively / 🔴 Packed
    2. 🎵 DJ Discovery — "Follow your favourite DJs and get notified the moment they're booked nearby tonight."
    3. 👥 Track Your Crew — "See where your friends checked in right now. Who's out tonight? Barblink knows."
    4. 📸 Share Your Night — "Post photos, rate your drinks, share stories — a social feed built for nightlife moments."
    5. 🗺️ Nightlife Passport — "Every bar you've visited pinned on your personal map. Build your KL story."
    6. 🔥 Weekly Leaderboards — "Who's the most active in Bukit Bintang this week? Climb the leaderboards."

### 4. DJ Discovery Section
- Two-column layout (left: animated DJ profile cards, right: text)
- Left side: 3 stacked/offset DJ profile card mockups with floating animation:
  - Card 1 (front, full opacity): DJ name "KYRA", genre "House · Techno", gig at "Zouk KL — Tonight 11PM"
  - Card 2 (slightly offset, 70% opacity): "LI BROTHERS", "Hip-Hop · R&B", gig at "Kyo Bar"
  - Card 3 (further back, 50% opacity): "SAXMAN KL", "Live Jazz", gig at "Taps Beer Bar"
  - Cards animate with Framer Motion `animate` y-axis floating (staggered)
- Right side text:
  - Label: "DJ PROFILES"
  - Title: "Know where they're playing tonight"
  - Body: "Follow your favourite DJs and live bands. Get notified automatically when they're booked at a venue in KL."
  - 4 checkmark list items (purple circle checkmarks):
    - Search DJs by name or genre
    - See their full upcoming event calendar
    - Rate DJs after attending their set
    - "Who's Hot This Week" trending DJs

### 5. Blink Feed Section
- Two-column layout (left: text, right: phone mockup)
- Right side: Phone frame mockup showing the Blink Feed:
  - Phone frame: dark rounded rectangle with subtle purple border glow
  - Inside phone screen:
    - "blink feed" header
    - Stories strip (4 circular avatars with neon purple rings)
    - Hero post card (dark coloured background simulating a photo, venue tag badge, username, caption, like/comment/share)
    - Two check-in mini-cards side by side (venue name in purple, crowd dot + status)
  - Note: check-in cards have NO QR code — they are compact status cards showing "Bryan is at Kyo Bar 🔴 Packed"
- Left side text:
  - Label: "THE BLINK FEED"
  - Title: "A feed built for nights out"
  - Body: "Not Instagram. Not TikTok. A social feed designed for nightlife — check-ins, crowd meters, stories, and real-time crew tracking in one scroll."
  - "Join the Waitlist" button

### 6. Waitlist Section
- Centered card (max-width 680px, dark surface, purple border, large border-radius)
- Subtle purple radial glow from top center
- Label: "EARLY ACCESS"
- Title: "Be first in KL to **Blink in**" (Blink in = purple)
- Body: "Join the waitlist. We'll let you know the moment Barblink drops in Kuala Lumpur."
- Form: email input (rounded, dark bg) + "Get Access" button (purple pill)
- After submit: hide form, show success message "🎉 You're on the list! We'll be in touch soon." in green
- Below form: "No spam. Just your launch notification. 🦉" (muted, small)
- On submit: POST to `/api/waitlist` (Next.js route handler) which calls the notification-service

### 7. Footer
- Three-column layout:
  - Left: 🦉 BARBLINK logo
  - Center: Links — Privacy Policy | Terms of Service | Contact | Instagram
  - Right: © 2025 Barblink · Made for KL nightlife 🇲🇾
- Top border: 1px rgba(255,255,255,0.06)
- All text muted

---

## API Route — Waitlist
Create `app/api/waitlist/route.ts`:
```ts
export async function POST(req: Request) {
  const { email } = await req.json()
  await fetch(`${process.env.API_URL}/notifications/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, source: 'landing_page' })
  })
  return Response.json({ success: true })
}
```

---

## Environment Variables
```
NEXT_PUBLIC_SITE_URL=https://barblink.com
API_URL=https://api.barblink.com/v1
```

---

## Important Notes
- Check-in is a ONE-TAP STATUS UPDATE — no QR code, no scanning. Reflect this in any copy that mentions check-ins.
- The phrase "Blink, You're In" is the tagline — use it naturally in copy.
- All copy should feel nightlife-energetic, not corporate SaaS.
- The landing page is Phase 1 only — no app download buttons yet, just the waitlist.
- App Store + Play Store buttons will be added in Phase 2 (launch day) — add them as hidden/placeholder elements now for easy swap.
- Mobile responsive is required — the page must look great on iPhone and Android.

---

## File Structure
```
apps/landing/
├── app/
│   ├── layout.tsx          ← root layout, Google Fonts, metadata
│   ├── page.tsx            ← main landing page (imports all sections)
│   ├── globals.css         ← CSS variables, base styles
│   └── api/
│       └── waitlist/
│           └── route.ts    ← POST handler for waitlist signup
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx            ← includes canvas particle animation
│   ├── Features.tsx
│   ├── DJDiscovery.tsx
│   ├── BlinkFeed.tsx       ← phone mockup section
│   ├── Waitlist.tsx
│   └── Footer.tsx
├── public/
│   └── (images, og-image.png)
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## SEO (in layout.tsx)
```ts
export const metadata = {
  title: 'Barblink — Blink, You\'re In.',
  description: 'KL\'s nightlife social app. Discover bars, follow your favourite DJs, and track your crew.',
  openGraph: {
    title: 'Barblink — Blink, You\'re In.',
    description: 'KL\'s nightlife social app.',
    url: 'https://barblink.com',
    images: ['/og-image.png'],
  }
}
```
