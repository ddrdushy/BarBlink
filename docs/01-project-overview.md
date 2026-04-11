# 01 — Project Overview

## What is Barblink?

Barblink is a **nightlife social media platform** built for Malaysia, starting with Kuala Lumpur. It connects people through a social-first mobile app built around bar and club culture — check-ins, posts, stories, DJ discovery, and real-time venue activity.

**Tagline:** Blink, You're In
**Mascot:** Owl perched on a spilled martini glass
**Domain:** barblink.com
**GitHub:** https://github.com/AiSenseiMY/BarBlink

---

## Strategy

**Social media first.** Grow to 1,000 DAU before adding venue commerce (reservations, ordering, payments). The app must be compelling as a social product on its own before any transactional features are added.

---

## Target Audience

- 18+ non-Muslim users in Kuala Lumpur, Malaysia
- Nightlife regulars — bar-hoppers, club-goers, live music fans
- DJ and live band followers
- Groups of friends planning nights out

---

## Languages

| Phase | Languages |
|---|---|
| Phase 1 | English only |
| Phase 2 | English + Mandarin |
| Phase 3 | English + Mandarin + Tamil |

---

## Brand

| Element | Value |
|---|---|
| Background | #0D0D0F (near black) |
| Primary accent | #C45AFF (neon purple) |
| Theme | Dark only |
| UX principle | Drunk-friendly — 48px minimum touch targets, max 3 taps to any action |
| Typography | Bold, high contrast, legible at night |

---

## Account Types

| Type | Description |
|---|---|
| User | Regular app user (18+ verified) |
| Admin | Platform administrator — manages venues, users, content |

> Venue accounts, venue terminals, and venue manager apps are **Phase 2** (post 1,000 DAU).

---

## Core Platform Rules

1. **Dark theme only** — every UI built on `#0D0D0F`
2. **Open source only** — no paid cloud services at launch
3. **TypeScript everywhere** — strict mode across all services
4. **Mobile first** — React Native is primary
5. **Drunk-friendly UX** — 48px touch targets, max 3 taps to any action
6. **18+ gated** — age verification is the first screen, non-negotiable
7. **Malaysia first** — MYR, GMT+8, English → Mandarin → Tamil

---

## What's In Scope (Phase 1)

- User mobile app (iOS + Android)
- Social feed, posts, stories, check-ins
- Venue discovery (map + list)
- Venue profiles (admin-managed, Instagram + Google scraped)
- DJ & band profiles (auto-generated from scrape)
- Events feed & RSVP
- Chat & friends system
- Bar Buddy matching (premium)
- Admin panel (web)
- Landing page (barblink.com) with waitlist
- App Store + Play Store submission prep

## What's Out of Scope (Phase 2)

- Table reservations
- In-app drink ordering
- Payments & premium subscriptions
- Venue terminal app
- Venue manager app
- Ads platform
- Venue self-onboarding
