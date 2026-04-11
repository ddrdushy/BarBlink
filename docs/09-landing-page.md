# 09 — Landing Page

## Overview

**URL:** barblink.com
**Stack:** Next.js 14 (App Router)
**Hosting:** VPS 1 via Coolify (same server as backend services)
**Language:** English only (Phase 1)

---

## Goal

Phase 1: Collect waitlist email signups before app launch.
Phase 2: Replace waitlist CTA with App Store + Play Store download buttons on launch day.

---

## Design Direction

- **Dark theme** — background #0D0D0F, same as the app
- **Video background** on hero section — nightlife atmosphere (dark club footage or abstract dark motion)
- **Vibrant and animated** — not a generic SaaS landing page
- **Neon purple (#C45AFF)** as primary accent throughout
- Unique layout — sections with diagonal cuts, overlapping elements, bold typography
- Feels like the brand, not a template

---

## Page Sections

### 1. Hero
- Full-screen video background (dark nightlife atmosphere)
- Barblink logo + owl mascot
- Headline: **"Blink, You're In."**
- Subheadline: "KL's nightlife social app — discover bars, track your crew, and follow your favourite DJs."
- Waitlist email input + "Get Early Access" button (Phase 1)
- App Store + Play Store badges (Phase 2, replaces waitlist)
- Subtle animated neon glow on CTA button

### 2. What is Barblink
- 3 feature highlights in a grid:
  - 📍 Discover bars and clubs near you — real-time crowd meter
  - 🎵 Follow your favourite DJs — know where they're playing tonight
  - 👥 See where your crew is — check in and share your night
- Each highlight has an icon, bold heading, short description
- Animated on scroll-in

### 3. Social Feed Preview
- Animated mockup of the Blink Feed on a phone frame
- Shows hero post card + check-in card design
- Neon purple highlights on UI elements

### 4. DJ Discovery Teaser
- "Know where your favourite DJs are playing" heading
- Visual showing DJ profile cards with upcoming gig listings
- Genre tag pills (EDM, Hip-Hop, R&B, House, Live Band)

### 5. App Screenshots Carousel
- Phone frames showing key screens:
  - Home feed (Blink Feed layout)
  - Venue discovery map
  - DJ profile page
  - Check-in screen
- Auto-scroll or draggable carousel

### 6. Waitlist CTA (Phase 1 only)
- "Be the first in KL to get access"
- Email input + submit button
- Counter: "X people already on the waitlist" (live count from DB)
- Social proof — "Launching in Kuala Lumpur"

### 7. Footer
- Barblink logo
- Links: Privacy Policy | Terms of Service | Contact
- Social media icons: Instagram, TikTok, X (Twitter)
- Copyright: © 2025 Barblink. All rights reserved.
- "Made for KL nightlife 🇲🇾"

---

## Waitlist Email Flow

1. User enters email on landing page
2. Frontend calls `POST /notifications/waitlist`
3. notification-service stores email in `waitlist_emails` table
4. Mailgun sends a branded welcome email immediately:
   - Subject: "You're on the Barblink list 🦉"
   - Body: "You're in. We'll let you know the moment Barblink drops in KL."
   - Barblink branding, dark theme email template
5. Admin can view all waitlist signups in admin panel
6. On launch day: admin sends blast email to all waitlist via admin panel → Mailgun

---

## Mailgun Setup

- Domain: mg.barblink.com (subdomain for email sending)
- Free tier: 100 emails per day
- DKIM + SPF records configured on Cloudflare DNS
- From address: hello@barblink.com
- Environment variable: `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`

---

## SEO

- Title: "Barblink — KL's Nightlife Social App"
- Description: "Discover bars and clubs in Kuala Lumpur, follow your favourite DJs, and track your crew. Download Barblink."
- OG image: branded dark graphic with logo and tagline
- Sitemap.xml and robots.txt

---

## Deployment

- Hosted on VPS 1 via Coolify
- Nginx serves Next.js app on port 3000 internally
- Cloudflare proxies barblink.com → VPS 1
- SSL via Let's Encrypt (auto-managed by Coolify)
- GitHub Actions: push to main → Coolify redeploys automatically
