# 05 — Tech Stack

## Philosophy
- 100% open source — no paid cloud services at launch
- VPS-first — single Hetzner CX31, scales up in-place
- Microservices — each domain is an independent NestJS service
- TypeScript everywhere — strict mode, shared types package
- Docker + Coolify — containerised, managed via Coolify dashboard
- Mobile first — React Native is the primary app

---

## Full Stack

| Layer | Technology | Notes |
|---|---|---|
| Mobile App | React Native + Expo | iOS and Android from one codebase |
| Admin Panel | Next.js 14 (App Router) | Web only, admin.barblink.com |
| Landing Page | Next.js 14 (App Router) | barblink.com, waitlist + app download |
| Backend Services | NestJS (Node.js) | One NestJS app per microservice |
| Scraper Service | NestJS + Playwright | Instagram + Google scraping |
| API Gateway | Nginx | Single entry point, routes to services |
| PaaS Manager | Coolify (self-hosted) | Deploy, SSL, domain management |
| Database | PostgreSQL | One database per service |
| Cache | Redis | Sessions, feed cache, crowd data, rate limiting |
| Message Queue | Redpanda (Kafka-compatible) | Async event bus between services |
| Search | Meilisearch | Venue and DJ full-text search |
| Real-time | Socket.io | Live crowd meter, chat |
| Media Storage | MinIO (S3-compatible) | Photos, videos, stories |
| Push Notifications | Firebase FCM | Free tier, iOS + Android |
| Email | Mailgun | Waitlist welcome emails, transactional email (free tier: 100/day) |
| Maps | OpenStreetMap + react-native-maps | Free, no API cost |
| CDN | Cloudflare (free tier) | DDoS protection, static asset caching |
| SSL | Let's Encrypt via Coolify | Auto-renew |
| Reverse Proxy | Nginx + Traefik via Coolify | |
| Monitoring | Grafana + Prometheus | Dashboards and alerts |
| Log Management | Grafana Loki | Centralised logs |
| CI/CD | GitHub Actions | Auto deploy on merge to main |
| Containers | Docker Compose | Phase 2: k3s (lightweight Kubernetes) |
| Monorepo | Turborepo | Fast builds, shared packages |
| ORM | Prisma | Type-safe DB queries |
| Auth | JWT + Refresh tokens | Access token 15min, refresh 30 days |
| File Uploads | Multer → MinIO | |
| Testing | Jest + Supertest | Unit + integration |

---

## Scraper Stack

| Tool | Purpose | Cost |
|---|---|---|
| Playwright | Headless browser for Instagram + Google scraping | Free / open source |
| playwright-extra + stealth plugin | Anti-detection for Instagram | Free / open source |
| Cheerio | HTML parsing after page load | Free / open source |
| Apify | Paid fallback for Instagram (Phase 2, if Playwright gets blocked) | Paid — future |

---

## VPS Infrastructure

### Single VPS — Hetzner CX31
- **Purpose:** Everything — all services, databases, apps
- **Spec:** 2 vCPU / 8GB RAM / 80GB NVMe SSD
- **OS:** Ubuntu 24.04 LTS
- **Provider:** Hetzner Cloud
- **Location:** Helsinki or Nuremberg (closest to Malaysia with good lat

---

## Microservices

| Service | Port | Responsibility |
|---|---|---|
| auth-service | 3001 | Login, 18+ DOB validation, JWT, OTP, refresh tokens |
| user-service | 3002 | Profiles, friends, preferences, trusted circle |
| venue-service | 3003 | Venue profiles, crowd capacity, DJ lineup |
| discovery-service | 3004 | Maps, Meilisearch search, filters, crowd meter |
| social-service | 3005 | Posts, stories, feed, likes, comments, reposts, bookmarks |
| checkin-service | 3006 | Solo and group check-ins, crowd counter (Redis), QR |
| chat-service | 3007 | DMs, group chats, message reactions (Socket.io) |
| notification-service | 3008 | FCM push, in-app notifications, Mailgun email |
| scraper-service | 3009 | Playwright Instagram + Google scraper, sync scheduler |
| dj-service | 3010 | DJ and band profiles, event calendar, ratings |
| events-service | 3011 | Events feed, RSVP, countdowns |
| community-service | 3012 | Leaderboards, streaks, badges, neighbourhood groups, venue collections |

---

## Inter-Service Communication

- **Synchronous:** REST HTTP between services via internal Docker network
- **Asynchronous:** Redpanda (Kafka) topics for events

| Event Topic | Publisher | Consumers |
|---|---|---|
| user.checked_in | checkin-service | social-service, notification-service, community-service |
| venue.scraped | scraper-service | venue-service, dj-service, events-service |
| scraper.failed | scraper-service | notification-service (admin alert) |
| post.created | social-service | notification-service |
| friend.request_sent | user-service | notification-service |
| event.rsvp | events-service | notification-service |
| dj.profile_created | dj-service | notification-service |

---

## Project Structure (Monorepo)

```
barblink/
├── CLAUDE.md
├── docs/
├── apps/
│   ├── mobile/               ← React Native (Expo) — user app
│   ├── admin/                ← Next.js 14 — admin panel
│   └── landing/              ← Next.js 14 — barblink.com landing page
├── services/
│   ├── auth-service/
│   ├── user-service/
│   ├── venue-service/
│   ├── discovery-service/
│   ├── social-service/
│   ├── checkin-service/
│   ├── chat-service/
│   ├── notification-service/
│   ├── scraper-service/
│   ├── dj-service/
│   ├── events-service/
│   └── community-service/
├── packages/
│   ├── shared-types/         ← TypeScript interfaces shared across all
│   ├── shared-utils/         ← Common utilities (dates, MYR, GPS, etc.)
│   ├── ui-components/        ← Shared React Native + React components
│   └── api-client/           ← Auto-generated API client
├── infrastructure/
│   ├── docker/               ← Docker Compose files
│   ├── nginx/                ← Reverse proxy config
│   └── coolify/              ← Coolify deployment configs
├── turbo.json
├── package.json
└── .env.example
```

---

## Environment Variables Pattern

Each service has its own `.env`:

```
DATABASE_URL=postgresql://user:pass@localhost:5432/barblink_{service}
REDIS_URL=redis://localhost:6379
REDPANDA_BROKERS=localhost:9092
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
JWT_SECRET=...
FCM_SERVER_KEY=...
MAILGUN_API_KEY=...
MAILGUN_DOMAIN=mg.barblink.com
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_KEY=...
PLAYWRIGHT_HEADLESS=true
```

---

## Growth Path

```
Phase 1: Single VPS — Hetzner CX31 (now)
  └── 2 vCPU / 8GB RAM / 80GB — Docker Compose + Coolify
  └── All services, databases, and apps on one machine

Phase 2: Upgrade in-place when DAU > 5,000
  └── Hetzner CX41: 4 vCPU / 16GB RAM / 160GB (~€15/mo)
  └── No migration needed — same machine, just resized

Phase 3: Upgrade again when DAU > 20,000
  └── Hetzner CX51: 8 vCPU / 32GB RAM / 240GB (~€28/mo)
  └── Or split databases to a second VPS (CCX13: 2 vCPU / 8GB dedicated)

Phase 4: k3s Kubernetes when DAU > 50,000
  └── Same Docker images, horizontal scaling across multiple nodes

Phase 5: Cloud migration when DAU > 100,000
  └── Hetzner Cloud managed services or AWS — same images, easy migration
```
