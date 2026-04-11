# Barblink — Docker Infrastructure

Everything you need to run the Barblink dev stack lives here. One `docker compose` command brings up the full Phase 0 infrastructure, plus a toolbox container with `eas-cli` preinstalled so you never have to install Expo tools on your host.

## What's in the stack

| Service | Port | Notes |
|---|---|---|
| PostgreSQL 16 + PostGIS 3.4 | `5432` | One cluster, 12 databases — one per microservice (see [init-postgres.sql](./init-postgres.sql)) |
| Redis 7 | `6379` | Cache, feed cache, live crowd counter |
| Redpanda 24.2 | `9092` (Kafka), `9644` (admin) | Kafka-compatible event bus |
| MinIO | `9000` (API), `9001` (console) | S3-compatible media storage |
| Meilisearch 1.11 | `7700` | Venue + DJ full-text search |
| EAS toolbox | n/a | Node 20 + pnpm 9 + `eas-cli` preinstalled |
| Landing (optional) | `3100` | Production Next.js image of `apps/landing` |

All data persists in named Docker volumes under the `barblink_` prefix. Run `docker compose down -v` to wipe them.

## Quick start

From the **repo root**:

```bash
# First time only — copy the env template
cp .env.docker.example .env

# Start the infra (postgres, redis, redpanda, minio, meilisearch)
pnpm stack:up
# or: docker compose up -d postgres redis redpanda minio meilisearch

# Tail logs
pnpm stack:logs

# Stop but keep data
pnpm stack:down

# Wipe everything
pnpm stack:reset
```

### Optional: run the landing page in Docker

```bash
docker compose --profile landing up -d landing
open http://localhost:3100
```

## EAS / Expo CLI via Docker

You do **not** need to install `eas-cli`, `expo-cli`, `pnpm`, or even Node on your host. The `./bin/eas` script runs everything inside the `barblink/eas-toolbox` Docker image.

```bash
# First call builds the image automatically
./bin/eas login                                # opens the Expo auth flow
./bin/eas whoami                               # confirm
./bin/eas init --id <your-project-id>          # link this workspace
./bin/eas build --platform ios --profile preview
./bin/eas build --platform android --profile preview
./bin/eas submit --platform ios
./bin/eas update --branch production

# Run any expo-cli command
./bin/eas expo start --web
./bin/eas expo doctor

# Drop into an interactive shell inside the toolbox
./bin/eas shell
```

Your Expo login state lives in the `barblink_eas_home` volume, so `./bin/eas login` only has to run once — subsequent calls stay authenticated.

There are convenience aliases in `package.json`:

```bash
pnpm eas login
pnpm eas:build:ios
pnpm eas:build:android
pnpm eas:whoami
```

## Why the Expo dev server is **not** in Docker

Running `pnpm expo start` for `apps/mobile` should happen on the host, not inside Docker. Two reasons:

1. **iOS / Android simulators can't reach a bundler inside a macOS Docker container reliably.** The Metro bundler needs to be accessible on your host's LAN so the simulator, the Android emulator, and Expo Go on your physical phone can all connect.
2. **File watching across a macOS bind mount is slow.** You'd get janky Fast Refresh.

So the split is:

| Task | Where it runs |
|---|---|
| `pnpm expo start` / fast refresh / simulator dev | **Host** (native, fast) |
| `eas build` / `eas submit` / `eas update` / `eas login` | **Docker** (via `./bin/eas`) |
| Postgres, Redis, Redpanda, MinIO, Meilisearch | **Docker** |
| Landing page (prod build test) | **Docker** (profile `landing`) |

This gives you the best of both worlds — reproducible infra and tooling without the host-dev overhead.

## Connecting local services to these containers

When a backend service (running on the host, e.g. `auth-service`) needs to talk to Postgres / Redis / etc., use these URLs in its `.env`:

```env
DATABASE_URL=postgresql://barblink:barblink_dev@localhost:5432/barblink_auth
REDIS_URL=redis://localhost:6379
REDPANDA_BROKERS=localhost:9092
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=barblink
MINIO_SECRET_KEY=barblink_dev_minio
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_KEY=barblink_dev_meili
```

When a **containerized** service needs to reach another container, use the service name instead (e.g. `postgres`, `redis`, `redpanda:29092`, `minio:9000`, `meilisearch:7700`). Docker's internal DNS resolves them.

## Health checks

All five infra services define healthchecks. After `docker compose up -d`:

```bash
docker compose ps
# Expect STATUS: (healthy) within ~30s for all services
```

If something's unhealthy, check logs:

```bash
docker compose logs postgres
docker compose logs redpanda
```

## File layout

```
infrastructure/docker/
├── Dockerfile.eas          # Node 20 + pnpm + eas-cli toolbox image
├── init-postgres.sql       # Creates the 12 service databases + extensions
└── README.md               # This file

docker-compose.yml          # (repo root) All services defined here
.env.docker.example         # Copy to .env, then edit as needed
bin/eas                     # Host-side wrapper — runs eas in Docker
apps/landing/Dockerfile     # Production multi-stage build
```

## Common issues

**Port already in use** — another app is binding the same port. Either stop that app or override the port in `.env` (e.g. `POSTGRES_PORT=5433`).

**`./bin/eas: Permission denied`** — make it executable: `chmod +x bin/eas`.

**Postgres init script didn't run** — init scripts only execute on an empty data directory. Wipe volumes with `docker compose down -v` and bring the stack back up.

**Redpanda won't start on older Docker** — Redpanda needs Docker 20+. Check with `docker --version`.
