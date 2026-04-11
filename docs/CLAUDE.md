# CLAUDE.md — Barblink Master Brief

> Read this file first. Then read all files in /docs before writing any code.

---

## What is Barblink?

Barblink is a **nightlife social media platform** for Kuala Lumpur, Malaysia.
It connects 18+ non-Muslim users through a social-first mobile app built around bar and club culture.

**Tagline:** Blink, You're In.
**Domain:** barblink.com
**Repo:** https://github.com/ddrdushy/BarBlink

---

## Strategy

Social media first. Grow to 1,000 DAU before adding venue commerce.
The app must be compelling as a social product before any transactional features.

---

## Document Index

| File | What It Covers |
|---|---|
| `docs/01-project-overview.md` | Vision, scope, strategy, account types, phase boundaries |
| `docs/02-features-social.md` | All social features — feed, posts, friends, DJ profiles, events, safety, gamification |
| `docs/03-features-venue.md` | Venue profiles, Instagram + Google scraping, crowd meter, discovery |
| `docs/04-features-admin.md` | Admin panel — venue management, scraper, user management, moderation |
| `docs/05-tech-stack.md` | Full tech stack, VPS infrastructure, microservices list, monorepo structure |
| `docs/06-database-schema.md` | PostgreSQL schemas per service |
| `docs/07-api-structure.md` | All REST API endpoints per service |
| `docs/08-build-order.md` | Exact build sequence — Phase 0 through Phase 11 |
| `docs/09-landing-page.md` | Landing page spec, waitlist flow, Mailgun setup |
| `docs/10-app-store-submission.md` | iOS + Android submission guide, assets, checklist |
| `docs/11-brand-guidelines.md` | Colours, typography, UX principles, voice, mascot |

---

## Core Rules for Claude Code

1. **Dark theme only** — every UI built on `#0D0D0F` background
2. **Open source only** — no paid cloud services at launch (see `docs/05-tech-stack.md`)
3. **TypeScript everywhere** — all services and apps, strict mode
4. **Mobile first** — React Native (Expo) is the primary app
5. **Drunk-friendly UX** — minimum 48px touch targets, max 3 taps to any action
6. **Monorepo** — Turborepo, everything under `/barblink`
7. **18+ gated** — age verification is the FIRST screen, non-negotiable
8. **Malaysia first** — GMT+8 timezone, English (Phase 1), Mandarin (Phase 2), Tamil (Phase 3)
9. **Follow the build order** — never skip phases, each must be testable before the next

---

## What's In Scope (Phase 1)

- User mobile app (iOS + Android) — React Native + Expo
- Admin panel (web) — Next.js 14
- Landing page — Next.js 14 (barblink.com)
- All backend microservices — NestJS
- Scraper service — Playwright (Instagram + Google)
- Social feed, posts, stories, check-ins
- Venue discovery (map + list)
- Venue profiles (admin-managed, scraped)
- DJ & band profiles (auto-generated)
- Events feed & RSVP
- Chat & friends system
- Community features (streaks, leaderboards, collections)

## What's Out of Scope (Phase 2 — after 1,000 DAU)

- Table reservations
- In-app drink ordering
- Payments & premium subscriptions
- Bar Buddy premium matching
- Venue self-onboarding
- Venue terminal app
- Venue manager app
- Ads platform

---

## Quick Start for Claude Code

```
Read CLAUDE.md and all files in /docs, then help me build [specific feature].
Start with docs/08-build-order.md to know what to build next.
```

---

## Tech Summary

| Layer | Tech |
|---|---|
| Mobile | React Native + Expo |
| Admin & Landing | Next.js 14 |
| Backend | NestJS microservices |
| Scraper | Playwright (headless) |
| Database | PostgreSQL (per service) |
| Cache | Redis |
| Queue | Redpanda (Kafka) |
| Search | Meilisearch |
| Real-time | Socket.io |
| Media | MinIO |
| Email | Mailgun |
| Push | Firebase FCM |
| Maps | OpenStreetMap |
| Deploy | Docker + Coolify on single Hetzner CX31 VPS |
| Monorepo | Turborepo |
