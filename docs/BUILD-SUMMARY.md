# Barblink — Build Summary

**Built:** April 11–12, 2026
**Repo:** https://github.com/ddrdushy/BarBlink
**Status:** Feature-complete, ready for beta testing

---

## What is Barblink?

Nightlife social media app for Kuala Lumpur and Colombo. Tagline: "Blink, You're In."
Dark theme (#0D0D0F + neon purple #C45AFF), 18+ gated, mobile-first.

---

## Architecture

```
barblink/
├── apps/
│   ├── mobile/          React Native (Expo SDK 54) — iOS/Android/Web
│   ├── admin/           Next.js 14 — admin.barblink.com (port 3200)
│   └── landing/         Next.js 14 — barblink.com (port 3100)
├── services/
│   ├── auth-service/         Port 3001 — Register, OTP, JWT, admin auth
│   ├── user-service/         Port 3002 — Profiles, follows, search
│   ├── venue-service/        Port 3003 — Venue CRUD, 55 seeded venues
│   ├── discovery-service/    Port 3004 — Nearby search, map data
│   ├── social-service/       Port 3005 — Posts, likes, comments, upload
│   ├── checkin-service/      Port 3006 — Check-in/out, crowd counts
│   ├── chat-service/         Port 3007 — Conversations, messages
│   ├── notification-service/ Port 3008 — Push (FCM), in-app, device tokens
│   ├── scraper-service/      Port 3009 — Playwright Instagram + Google
│   ├── dj-service/           Port 3010 — DJ/band profiles, genres
│   ├── events-service/       Port 3011 — Events, RSVP
│   └── community-service/    Port 3012 — Streaks, badges, leaderboards
├── packages/
│   ├── shared-types/         TypeScript interfaces for all entities
│   └── shared-utils/         Rate limiting guard, config utilities
└── infrastructure/
    ├── docker/               Dockerfiles, init-postgres.sql
    ├── monitoring/           Prometheus + Grafana + Loki configs
    ├── coolify/              Deployment guide
    └── nginx/                Reverse proxy config
```

---

## Docker Stack (19 containers)

```bash
pnpm stack:up          # postgres, redis, redpanda, minio, meilisearch
pnpm stack:services    # all 12 backend services + scraper
# Optional profiles:
docker compose --profile landing up -d    # landing page
docker compose --profile admin up -d      # admin panel
docker compose --profile monitoring up -d # grafana + prometheus
```

| Container | Port | Purpose |
|-----------|------|---------|
| barblink-postgres | 5433 | PostgreSQL 16 + PostGIS (12 databases) |
| barblink-redis | 6379 | Cache, sessions, rate limiting |
| barblink-redpanda | 9092 | Kafka-compatible event bus |
| barblink-minio | 9000 | S3-compatible media storage |
| barblink-meilisearch | 7700 | Full-text search |
| barblink-auth-service | 3001 | Auth + admin accounts |
| barblink-user-service | 3002 | Profiles + follows |
| barblink-venue-service | 3003 | Venue CRUD |
| barblink-discovery-service | 3004 | Nearby + search |
| barblink-social-service | 3005 | Feed + uploads |
| barblink-checkin-service | 3006 | Check-ins + crowd |
| barblink-chat-service | 3007 | Chat |
| barblink-notification-service | 3008 | Notifications |
| barblink-scraper-service | 3009 | Playwright scraper |
| barblink-dj-service | 3010 | DJ profiles |
| barblink-events-service | 3011 | Events + RSVP |
| barblink-community-service | 3012 | Gamification |
| barblink-landing | 3100 | Marketing site |
| barblink-admin | 3200 | Admin panel |

---

## Mobile App (Expo / React Native)

### Auth Flow
1. Splash → auto-redirect if token exists
2. Welcome → "Get started" or "Already have an account"
3. Age Gate (18+ hard block)
4. Phone (country picker — MY, LK, + 10 tourist countries)
5. Email (OTP delivery channel)
6. OTP verification (6-digit, resend support)
7. Profile Setup (username, display name, country picker)
8. T&C consent
9. Home tabs

### 5 Tabs (all wired to real backends)
- **Feed** — posts with likes/comments, hero card, create post with photo upload, notification bell
- **Discover** — venue list with category filters + map view (Leaflet/OpenStreetMap), crowd badges
- **Check-in** — venue list with check-in buttons, active check-in card with timer, check-out
- **Chat** — conversation list, new chat modal (user search), message bubbles (send/receive)
- **Profile** — real data, follower/following counts, badges/streaks from community-service, find friends, logout

### Additional Screens
- Post detail (comments, like toggle)
- Create post (caption + venue tag + photo upload)
- Venue detail (description, tags, hours, capacity, crowd count, check-in button)
- Friend search (search users, follow button)
- Notifications (bell icon, mark all read)

---

## Admin Panel (Next.js 14)

**Login:** admin@barblink.com / admin123 (email+password, JWT role: admin)

### 13 Pages

| Page | Data Source | Features |
|------|------------|----------|
| **Dashboard** | Real (4 services) | Stats cards, DAU progress bar, activity feed (live), quick actions |
| **Analytics** | Partial (stats real, charts mock) | DAU chart, engagement bars, top venues table |
| **Venues** | Real (venue-service) | Table, search, country filter, add/edit venue forms |
| **DJs & Bands** | Real (dj-service) | Table, add DJ form, genre tags |
| **Events** | Real (events-service) | Table, add event, RSVP counts |
| **Posts** | Real (social-service) | Table, like/comment counts, admin delete |
| **Check-ins** | Real (checkin-service) | Table, today's stats, active count |
| **Users** | Real (user-service) | Table, search, suspend/ban actions |
| **Reports** | Mock (no backend yet) | Moderation queue layout |
| **Leaderboard** | Partial (tries community-service) | Weekly rankings, country filter |
| **Scraper** | Real (scraper-service) | Stats, manual trigger, job history |
| **Waitlist** | Mock (tries API) | Table, CSV export, launch email |
| **Settings** | Real (auth-service) | 5 integration sections, save/test |

### Sidebar Navigation (sectioned)
- Overview: Dashboard, Analytics
- Content: Venues, DJs, Events, Posts, Check-ins
- Community: Users, Reports, Leaderboard
- Platform: Scraper, Waitlist, Settings

---

## Landing Page (barblink.com)

- Hero with particle canvas + "Blink, You're In."
- Live Tonight marquee
- FOMO Hook chat mockup
- Features grid
- Blink Feed phone mockup
- DJ Discovery card stack
- Crowd Meter demo
- Nightlife Passport map
- Community voices
- FAQ accordion
- Waitlist signup form → /api/waitlist
- Legal pages: /privacy, /terms, /community

---

## Backend Services — Key Features

### auth-service (3001)
- User: register (18+ DOB), send-otp, verify-otp, JWT + refresh tokens
- Admin: email+password login, auto-seed on first run, 24h JWT
- Dev bypass: phone +60000000000 always accepts OTP 123456
- Multi-country phone validation (E.164 format)
- Platform settings CRUD with audit log

### user-service (3002)
- Profile CRUD with country field (MY/LK)
- Follow system: send request, accept/reject, followers/following lists
- User search by username
- Admin: list users, suspend/ban, stats

### venue-service (3003)
- CRUD with slug generation
- 55 seeded venues (35 KL + 20 Colombo)
- Filter by country, area, category
- Admin endpoints for venue management

### social-service (3005)
- Posts with caption + venue tag + media URLs
- Feed with like count, comment count, isLikedByMe
- Like/unlike with optimistic UI
- Comments CRUD
- Photo upload to MinIO (POST /v1/upload, 10MB max)
- Publishes post.created to Redpanda

### checkin-service (3006)
- One-tap check-in (auto-checkout previous)
- 6-hour auto-expiry
- Crowd count per venue (public endpoint)
- Who's out tonight
- Publishes user.checked_in to Redpanda

### notification-service (3008)
- In-app notifications (like, comment, checkin, follow, event)
- Mark read / mark all read
- Device token registration for push
- Firebase Admin SDK integration (console fallback in dev)

### scraper-service (3009)
- Playwright browser automation
- Instagram: bio, photos (up to 12), post captions, DJ name detection
- Google: address, rating, phone, opening hours
- 12-hour scheduled auto-scrape cycle
- Job history with status tracking

### community-service (3012)
- User streaks (current + longest)
- Badges (night_owl, explorer, regular, social_butterfly, first_checkin)
- Weekly leaderboard (top 20 by streak)
- Venue collections (create, add/remove venues)

---

## Data & Seeding

| Data | Count |
|------|-------|
| Venues | 55 (35 KL + 20 Colombo) |
| DJs | 15 (10 KL + 5 Colombo) |
| Events | 10 (7 KL + 3 Colombo) |
| Test user | phone: 000000000, OTP: 123456 |
| Admin | admin@barblink.com / admin123 |

```bash
./bin/seed-test-user.sh                    # creates test user + profile
cd services/venue-service && npx prisma db seed   # 55 venues
cd services/dj-service && npx prisma db seed      # 15 DJs
cd services/events-service && npx prisma db seed  # 10 events
```

---

## Multi-Country Support

- Phone: country picker with 12 countries (MY + LK priority, 10 tourist)
- Profile: country field determines content filtering
- Venues: filtered by country (MY shows KL, LK shows Colombo)
- Areas: 10 KL neighborhoods + 5 Colombo neighborhoods
- Landing page: "KL & Colombo" messaging

---

## CI/CD

GitHub Actions pipeline (.github/workflows/ci.yml):
1. TypeCheck: shared-types + landing page
2. Build Landing: Next.js production build
3. Build Services: parallel matrix build for all 12 NestJS services
4. Docker Build: all images on main branch

---

## Monitoring

```bash
docker compose --profile monitoring up -d
```

- **Prometheus** (port 9090) — metrics collection
- **Grafana** (port 3300) — dashboards (admin/barblink_grafana)
- **Loki** — centralized log aggregation
- **cAdvisor** (port 8080) — container metrics

---

## Event Bus (Redpanda/Kafka)

Services publish events via kafkajs:
- `post.created` — social-service after new post
- `user.checked_in` — checkin-service after check-in
- `friend.request_sent` — user-service after follow request

notification-service subscribes and triggers push/in-app notifications.

---

## Deployment Guide

See `infrastructure/coolify/deploy.md` for:
- Hetzner VPS setup (CX31: 2 vCPU / 8GB RAM)
- Cloudflare DNS configuration
- Nginx reverse proxy routing
- Production environment variables
- SSL via Let's Encrypt
- Deployment checklist

---

## Quick Start

```bash
# Clone
git clone https://github.com/ddrdushy/BarBlink.git
cd BarBlink

# Start infra + services
pnpm stack:up
pnpm stack:services

# Seed data
./bin/seed-test-user.sh

# Mobile (on host, not Docker)
pnpm --filter @barblink/mobile dev

# Admin panel
open http://localhost:3200
# Login: admin@barblink.com / admin123

# Landing page
open http://localhost:3100
```

---

## Git History (key commits)

| Commit | What |
|--------|------|
| 4de6085 | Initial commit: docs + landing page |
| 7d8e35a | Monorepo scaffold + mobile app |
| 3de8763 | Docker dev stack + EAS toolbox |
| 6bd1cd7 | auth-service + multi-country phone |
| fbd3972 | Wire mobile auth to backend |
| 2e27721 | venue-service + 15 seeded venues + Discover tab |
| 46a72ce | checkin-service + crowd counts |
| 7765a64 | social-service + feed + posts + likes |
| d568a9a | Enterprise admin panel (8 pages) |
| 7669598 | All remaining services (discovery, dj, events, chat, notification, community) |
| 952d7fe | Scraper service (Playwright) |
| 93db9aa | 55 venues + Coolify deploy guide |
| 7c0f9c9 | Admin auth upgrade (email+password + JWT roles) |
| 189bee2 | Photo upload + chat messaging + Redpanda events |
