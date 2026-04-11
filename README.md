# Barblink

> **Blink, You're In.** — KL's nightlife social app.

A social-first mobile + backend platform for Kuala Lumpur nightlife. Discover bars and clubs, follow your favourite DJs, track your crew, and share your night — all from one app. Built as a pnpm + Turborepo monorepo with a React Native (Expo) mobile app that targets iOS, Android, and web from **one codebase**.

---

## Monorepo layout

```
barblink/
├── apps/
│   ├── mobile/               React Native (Expo) — iOS + Android + Web
│   └── landing/              Next.js 14 — barblink.com marketing + waitlist
├── services/                 NestJS microservices (coming — see docs/08)
├── packages/
│   └── shared-types/         Shared TypeScript interfaces (user, venue, DJ…)
├── infrastructure/
│   └── docker/               Dev stack: Postgres, Redis, Redpanda, MinIO, Meili
├── docs/                     Single source of truth — read this first
├── docker-compose.yml        Unified dev stack (infra + EAS toolbox + landing)
├── turbo.json
├── pnpm-workspace.yaml
└── bin/eas                   Host wrapper — runs eas-cli inside Docker
```

---

## Documentation

All the design decisions, features, and build order live in [`/docs`](./docs). Start there:

| File | What it covers |
|---|---|
| [docs/CLAUDE.md](./docs/CLAUDE.md) | Master brief + core rules |
| [docs/01-project-overview.md](./docs/01-project-overview.md) | Vision, scope, phase boundaries |
| [docs/02-features-social.md](./docs/02-features-social.md) | Feed, posts, friends, DJ profiles, gamification |
| [docs/03-features-venue.md](./docs/03-features-venue.md) | Venue profiles, crowd meter, Instagram + Google scrape |
| [docs/04-features-admin.md](./docs/04-features-admin.md) | Admin panel |
| [docs/05-tech-stack.md](./docs/05-tech-stack.md) | Full stack + infrastructure |
| [docs/06-database-schema.md](./docs/06-database-schema.md) | PostgreSQL per-service schemas |
| [docs/07-api-structure.md](./docs/07-api-structure.md) | REST endpoints |
| [docs/08-build-order.md](./docs/08-build-order.md) | **Phase 0 → Phase 11 build order** |
| [docs/09-landing-page.md](./docs/09-landing-page.md) | Landing page spec |
| [docs/10-app-store-submission.md](./docs/10-app-store-submission.md) | iOS + Android submission |
| [docs/11-brand-guidelines.md](./docs/11-brand-guidelines.md) | Colours, type, voice |

---

## Prerequisites

| Tool | Why |
|---|---|
| **Node 20+** | Runtime for everything JS |
| **pnpm 9** (via `corepack enable`) | Monorepo package manager |
| **Docker 24+** | Dev infrastructure + EAS toolbox |

You do **not** need `eas-cli`, `expo-cli`, or `xcode` / Android Studio installed on your host to get started — Docker covers it. You only need Xcode / Android Studio when you want to run the iOS simulator or Android emulator locally.

```bash
corepack enable
corepack prepare pnpm@9.12.0 --activate
pnpm install
```

---

## Quick start

```bash
# 1. Install deps
pnpm install

# 2. Bring up infra (Postgres, Redis, Redpanda, MinIO, Meilisearch)
cp .env.docker.example .env
pnpm stack:up

# 3. Run the landing page (host, fast refresh)
pnpm --filter @barblink/landing dev
open http://localhost:3100

# 4. Run the mobile app (host, fast refresh, press i/a/w)
pnpm --filter @barblink/mobile dev
```

---

## Dev stack (Docker)

The whole Phase 0 infrastructure from [docs/08](./docs/08-build-order.md) runs in Docker via a single compose file. See [infrastructure/docker/README.md](./infrastructure/docker/README.md) for the full details.

```bash
pnpm stack:up        # start postgres / redis / redpanda / minio / meilisearch
pnpm stack:down      # stop (keeps volumes)
pnpm stack:reset     # stop + wipe volumes
pnpm stack:logs      # tail everything
```

Services:

| URL | Use |
|---|---|
| `postgresql://barblink:barblink_dev@localhost:5432` | Postgres — 12 service databases |
| `redis://localhost:6379` | Redis |
| `localhost:9092` | Redpanda (Kafka-compatible) |
| http://localhost:9001 | MinIO web console (`barblink` / `barblink_dev_minio`) |
| http://localhost:7700 | Meilisearch |

---

## EAS / Expo CLI — from Docker

You don't install `eas-cli`, `expo-cli`, `pnpm`, or Node on your host. They all live inside the `barblink/eas-toolbox` Docker image. The `./bin/eas` script handles everything — runs the container, mounts the repo, persists your Expo login in a volume so you only log in once.

### One-time setup

```bash
# 1. Build the toolbox image (~800 MB, one-time, ~3 min)
docker compose build eas

# 2. Log in to your Expo account — opens the browser auth flow
./bin/eas login

# 3. Verify
./bin/eas whoami
```

After step 2, your Expo credentials live in the `barblink_eas_home` Docker volume. They persist across `docker compose down` and only get wiped with `docker compose down -v`.

### Linking the Barblink project (already done)

The repo is already wired to Expo project ID **`3ed36b0e-9c33-4a62-9e12-2e86fb7bc477`** — it's committed into [`apps/mobile/app.json`](./apps/mobile/app.json) under `extra.eas.projectId`. Running `./bin/eas init` is only needed if you change the project ID or if you're onboarding a fresh clone:

```bash
./bin/eas init --id 3ed36b0e-9c33-4a62-9e12-2e86fb7bc477
```

### Day-to-day EAS commands

```bash
./bin/eas whoami                                  # am I logged in?
./bin/eas build --platform ios --profile preview  # cloud build for iOS
./bin/eas build --platform android --profile preview
./bin/eas build --platform all --profile production
./bin/eas submit --platform ios                   # App Store Connect
./bin/eas submit --platform android               # Play Console
./bin/eas update --branch production              # OTA update
./bin/eas device:create                           # register a test device
./bin/eas channel:list
./bin/eas credentials                             # manage certs + keys
```

### Expo CLI from Docker too

Same wrapper, pass `expo` as the first arg:

```bash
./bin/eas expo doctor                 # sanity check the app
./bin/eas expo config --type public   # print the resolved app.json
./bin/eas expo install <pkg>          # add a dep with the right version
./bin/eas expo prebuild               # generate native ios/ and android/ folders
```

### Shell inside the toolbox

```bash
./bin/eas shell         # drops you in bash at /workspace/apps/mobile
# inside: eas, expo, pnpm, npm, node are all on PATH
```

### Shortcuts in `package.json`

```bash
pnpm eas login
pnpm eas:whoami
pnpm eas:build:ios
pnpm eas:build:android
```

### Why you still run `pnpm expo start` on the host (not Docker)

EAS Build, Submit, Update, Login — all happen in Docker (cloud or local container, your choice).

But the **dev server** for `apps/mobile` (`pnpm --filter @barblink/mobile dev`) runs on the **host**, not in Docker. On macOS, a container bundler can't reach the iOS simulator, the Android emulator, or your phone on the local WiFi reliably. So:

| Task | Where |
|---|---|
| Day-to-day coding with fast refresh | `pnpm --filter @barblink/mobile dev` on host |
| EAS cloud builds (`eas build`) | `./bin/eas build …` via Docker |
| Store submission (`eas submit`) | `./bin/eas submit …` via Docker |
| OTA updates (`eas update`) | `./bin/eas update …` via Docker |
| Expo CLI one-offs (`expo doctor`, etc.) | `./bin/eas expo …` via Docker |

This way you get reproducible tooling (no "works on my machine") for anything that touches Expo's cloud, while keeping dev loop speed intact.

---

## Why the mobile dev server runs on the host, not in Docker

The infrastructure is dockerized. The **Expo dev server** for `apps/mobile` is **not** — on macOS, Docker containers can't reach the iOS simulator or Android emulator reliably, and file watching across a bind mount is slow. Run `pnpm --filter @barblink/mobile dev` on the host and press `i`, `a`, or `w`. EAS builds for the App Store / Play Store still happen in Docker (via `./bin/eas`) or in the cloud (via the `eas build` service), so the actual production pipeline never touches the host.

---

## Scripts reference

| Command | What it does |
|---|---|
| `pnpm dev` | Runs `turbo run dev` (all workspaces in parallel) |
| `pnpm build` | Production build for every workspace |
| `pnpm typecheck` | Strict TS across all workspaces |
| `pnpm stack:up` | Start Docker infrastructure |
| `pnpm stack:down` | Stop infrastructure (keep data) |
| `pnpm stack:reset` | Stop + wipe volumes |
| `pnpm stack:logs` | Tail infra logs |
| `pnpm stack:build` | Rebuild Docker images |
| `pnpm eas <cmd>` | Run any EAS / Expo CLI command via Docker toolbox |
| `pnpm eas:login` | Log in to Expo (one-time per volume) |
| `pnpm eas:build:ios` | EAS cloud build for iOS (preview profile) |
| `pnpm eas:build:android` | EAS cloud build for Android (preview profile) |

---

## What's built so far

- ✅ Monorepo scaffold (pnpm + Turborepo)
- ✅ `packages/shared-types` — base TS interfaces
- ✅ `apps/landing` — full marketing + waitlist site (13 sections)
- ✅ `apps/mobile` — Expo app with auth flow (splash → age gate → phone → OTP → profile setup → 5-tab nav)
- ✅ Docker dev stack + EAS toolbox
- 🚧 `services/*` — NestJS backend services (Phase 1 onward — see [docs/08](./docs/08-build-order.md))
- 🚧 Admin panel (Phase 3)

---

## License

Private. © 2026 Barblink.
