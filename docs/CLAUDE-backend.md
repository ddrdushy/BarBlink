# Claude Code Instructions — Backend Services

## Phase Boundary — Read This First

Per `docs/01-project-overview.md`, the strategy is **social media first — grow to 1,000 DAU before adding venue commerce**.

This doc is split accordingly:

| Phase | Trigger | What gets built |
|---|---|---|
| **Phase 1 (NOW)** | Build immediately | Core social platform, admin panel, user auth, venue discovery, scraper |
| **Phase 2 (post-1,000 DAU)** | After 1,000 DAU milestone | Vendor portal, DJ portal, vendor/DJ accounts, payments, reservations |

**Do not build Phase 2 items until the DAU milestone is reached.**

---

## What Exists Right Now (as of current build)

- ✅ Admin panel UI (dashboard, venues, users, posts, check-ins)
- ✅ Basic user auth (phone OTP, JWT — user role only)
- ✅ Admin uses same JWT as users (needs fixing — see Section 3)
- ✅ `PlatformSetting` table (basic, no encryption, no audit log)
- ✅ Redpanda container running (but no service publishes events yet)
- ❌ Rate limiting not implemented
- ❌ Vendor/DJ accounts (Phase 2)
- ❌ Vendor/DJ portals (Phase 2)
- ❌ env-service (Phase 2)
- ❌ Redpanda event publishing in services

---

## Global Rules (all services)

- TypeScript strict mode — no `any` types
- All services use Prisma ORM
- Standard response format:
```ts
{ success: boolean, data: any | null, error: string | null, meta?: { page, limit, total } }
```
- All timestamps: stored UTC, returned ISO 8601, displayed GMT+8
- Pagination default: 20 per page, max 100
- All file uploads: MinIO via presigned URLs
- All services read external credentials (Mailgun, Twilio, FCM, MinIO) from the `platform_settings` table via a shared config utility — NOT from `.env`

---

# PHASE 1 — BUILD NOW

---

## 1. Configuration: .env vs Database

### .env — Bootstrap Only (10 variables)

The `.env` file contains ONLY what is needed before the database is accessible.

```
# Postgres — needed to connect to DB
DB_PASSWORD=changeme_strong_password

# Redis — needed to connect to Redis
REDIS_PASSWORD=changeme_strong_password

# JWT — needed by auth-service at startup
JWT_SECRET=generate_with_crypto_randomBytes_64_hex
JWT_REFRESH_SECRET=generate_another_64_byte_random_hex

# Encryption key for platform_settings secrets — NEVER change after first run
# Generate: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
SETTINGS_ENCRYPTION_KEY=exactly_32_chars_change_this_now!

# First-run admin seed — only used once to create the admin account
ADMIN_EMAIL=admin@barblink.com
ADMIN_INITIAL_PASSWORD=changeme_on_first_login
ADMIN_NAME=Platform Admin

# Environment
NODE_ENV=production
```

**That is the entire .env file. Nothing else.**

### platform_settings Table (all other config lives here)

All third-party credentials and platform settings are stored encrypted in the database and managed via the admin panel. Services fetch them at runtime via a shared `getConfig()` utility.

```sql
-- Add to barblink_admin database (create this DB on first run)
platform_settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         VARCHAR(100) UNIQUE NOT NULL,
  value       TEXT NOT NULL,              -- AES-256-GCM encrypted if is_secret = true
  description TEXT,
  category    VARCHAR(50) NOT NULL,
  is_secret   BOOLEAN DEFAULT TRUE,
  is_active   BOOLEAN DEFAULT TRUE,
  updated_by  UUID,                       -- admin_accounts.id
  updated_at  TIMESTAMPTZ DEFAULT NOW()
)

settings_audit_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key  VARCHAR(100) NOT NULL,
  action       VARCHAR(20) NOT NULL,      -- created | updated | deleted | revealed
  admin_id     UUID NOT NULL,
  admin_name   VARCHAR(100),
  old_value_hash TEXT,                   -- SHA256 of old value, NEVER store plaintext
  created_at   TIMESTAMPTZ DEFAULT NOW()
)
```

### Shared Config Utility (packages/shared-utils/src/config.ts)

```ts
import { createClient } from 'redis'
import { createDecipheriv } from 'crypto'

const redis = createClient({ url: process.env.REDIS_URL })
const KEY = Buffer.from(process.env.SETTINGS_ENCRYPTION_KEY!, 'utf8')

export async function getConfig(settingKey: string): Promise<string> {
  // 1. Check Redis cache (5 min TTL)
  const cached = await redis.get(`cfg:${settingKey}`)
  if (cached) return cached

  // 2. Query DB directly (each service has its own DB connection to barblink_admin)
  const setting = await prisma.platformSettings.findUnique({ where: { key: settingKey } })
  if (!setting) throw new Error(`Config key not found: ${settingKey}`)

  const value = setting.isSecret ? decrypt(setting.value) : setting.value

  // 3. Cache in Redis for 5 minutes
  await redis.setEx(`cfg:${settingKey}`, 300, value)
  return value
}

function decrypt(ciphertext: string): string {
  const [ivHex, tagHex, dataHex] = ciphertext.split(':')
  const decipher = createDecipheriv('aes-256-gcm', KEY, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  return decipher.update(Buffer.from(dataHex, 'hex')).toString('utf8') + decipher.final('utf8')
}
```

When admin updates a setting via the panel → `DEL cfg:{key}` in Redis → next request gets fresh value. **No service restart needed** for most settings.

### DB-Stored Settings (seeded with empty values on first run)

```ts
const SEED_SETTINGS = [
  // Email
  { key: 'MAILGUN_API_KEY',      category: 'email',    isSecret: true,  description: 'Mailgun API key' },
  { key: 'MAILGUN_DOMAIN',       category: 'email',    isSecret: false, description: 'Sending domain — mg.barblink.com' },
  { key: 'FROM_EMAIL',           category: 'email',    isSecret: false, description: 'From address — hello@barblink.com' },

  // SMS
  { key: 'TWILIO_SID',           category: 'sms',      isSecret: true,  description: 'Twilio Account SID' },
  { key: 'TWILIO_TOKEN',         category: 'sms',      isSecret: true,  description: 'Twilio Auth Token' },
  { key: 'TWILIO_PHONE_NUMBER',  category: 'sms',      isSecret: false, description: 'Twilio sending number e.g. +60xxxxxxxxx' },

  // Firebase
  { key: 'FCM_PROJECT_ID',       category: 'firebase', isSecret: false, description: 'Firebase project ID' },
  { key: 'FCM_PRIVATE_KEY',      category: 'firebase', isSecret: true,  description: 'Firebase private key JSON' },
  { key: 'FCM_CLIENT_EMAIL',     category: 'firebase', isSecret: true,  description: 'Firebase service account email' },

  // Storage
  { key: 'MINIO_ENDPOINT',       category: 'storage',  isSecret: false, description: 'MinIO endpoint — minio:9000' },
  { key: 'MINIO_ACCESS_KEY',     category: 'storage',  isSecret: true,  description: 'MinIO access key' },
  { key: 'MINIO_SECRET_KEY',     category: 'storage',  isSecret: true,  description: 'MinIO secret key' },
  { key: 'MINIO_BUCKET',         category: 'storage',  isSecret: false, description: 'Media bucket name — barblink-media' },

  // Search
  { key: 'MEILISEARCH_URL',      category: 'search',   isSecret: false, description: 'Meilisearch URL — http://meilisearch:7700' },
  { key: 'MEILISEARCH_KEY',      category: 'search',   isSecret: true,  description: 'Meilisearch master key' },

  // Scraper
  { key: 'PLAYWRIGHT_HEADLESS',  category: 'scraper',  isSecret: false, description: 'true or false' },
  { key: 'SCRAPER_INTERVAL_HRS', category: 'scraper',  isSecret: false, description: 'Sync interval hours — default 12' },
  { key: 'SCRAPER_MAX_RETRIES',  category: 'scraper',  isSecret: false, description: 'Retries before admin alert — default 3' },

  // Platform
  { key: 'DAU_PHASE2_TARGET',    category: 'platform', isSecret: false, description: 'DAU target to unlock Phase 2 — default 1000' },
  { key: 'APP_LAUNCH_MODE',      category: 'platform', isSecret: false, description: 'waitlist_only or live' },
  { key: 'CHECKIN_EXPIRY_HOURS', category: 'platform', isSecret: false, description: 'Check-in auto-expiry hours — default 3' },
  { key: 'SUPPORT_EMAIL',        category: 'platform', isSecret: false, description: 'support@barblink.com' },
]
```

---

## 2. Rate Limiting (add to ALL services — currently missing)

Use a NestJS guard backed by Redis. Apply globally via `APP_GUARD`.

```ts
// packages/shared-utils/src/rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common'
import { Redis } from 'ioredis'

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private redis: Redis) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const ip = request.ip || request.headers['x-forwarded-for']
    const path = request.path
    const key = `rl:${ip}:${path}`

    const limits: Record<string, { max: number; windowSec: number }> = {
      '/v1/auth/register':    { max: 5,   windowSec: 3600 },   // 5 per hour
      '/v1/auth/send-otp':    { max: 3,   windowSec: 3600 },   // 3 per hour
      '/v1/auth/login':       { max: 10,  windowSec: 900 },    // 10 per 15min
      '/v1/waitlist':         { max: 3,   windowSec: 86400 },  // 3 per day
      default:                { max: 100, windowSec: 60 },     // 100 per minute
    }

    const limit = limits[path] || limits['default']
    const current = await this.redis.incr(key)
    if (current === 1) await this.redis.expire(key, limit.windowSec)

    if (current > limit.max) {
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS)
    }
    return true
  }
}
```

Apply in every service's `main.ts`:
```ts
app.useGlobalGuards(new RateLimitGuard(redisClient))
```

---

## 3. auth-service — Fix Admin JWT (currently broken)

**Problem:** Admin currently uses the same phone OTP flow as regular users. Admin needs separate email+password login with its own JWT role.

### New Table: admin_accounts (add to barblink_auth DB)

```sql
admin_accounts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            VARCHAR(254) UNIQUE NOT NULL,
  password_hash    TEXT NOT NULL,
  name             VARCHAR(100) NOT NULL,
  totp_secret      TEXT,
  totp_enabled     BOOLEAN DEFAULT FALSE,
  last_login_at    TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
)
```

### JWT Payload (update existing interface)

```ts
interface JwtPayload {
  sub: string
  role: 'user' | 'admin'   // Phase 1: only 2 roles. vendor + dj added in Phase 2.
  iat: number
  exp: number
}
```

### Guards (update)

```ts
// UserGuard — role must be 'user'
// AdminGuard — role must be 'admin'
// JwtAuthGuard — any valid JWT (user or admin)
```

### New Admin Auth Endpoints

**POST /auth/admin/login**
```
Body: { email: string, password: string }
Logic:
  1. Find admin_account by email
  2. bcrypt compare password (reject if wrong)
  3. If totp_enabled = true:
     → Return { requiresTOTP: true, tempToken } (tempToken = short JWT, 5min expiry, not a full session)
  4. If totp_enabled = false:
     → Issue full JWT: { sub: admin.id, role: 'admin' }
  5. Update last_login_at
Response: { accessToken, refreshToken } OR { requiresTOTP: true, tempToken }
```

**POST /auth/admin/totp-verify**
```
Body: { tempToken: string, totpCode: string }
Logic:
  1. Verify tempToken signature + expiry
  2. Extract admin ID, load admin_account
  3. Verify TOTP code using speakeasy library against totp_secret
  4. Issue full admin JWT
```

**POST /auth/admin/setup-totp** — Admin auth required. Returns secret + QR code URL for Google Authenticator.
**POST /auth/admin/confirm-totp** — Admin auth required. Verifies code works, saves secret, sets totp_enabled = true.
**POST /auth/admin/change-password** — Admin auth required.

### First-Run Admin Seed

In auth-service `main.ts`, on startup:
```ts
const count = await prisma.adminAccount.count()
if (count === 0) {
  const hash = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD, 12)
  await prisma.adminAccount.create({
    data: {
      email: process.env.ADMIN_EMAIL,
      passwordHash: hash,
      name: process.env.ADMIN_NAME,
    }
  })
  console.log(`Admin account created: ${process.env.ADMIN_EMAIL}`)
  console.log('IMPORTANT: Change the admin password on first login.')
}
```

### Admin Login Page (admin.barblink.com/login)

Build a dedicated login page separate from the user app:
- Email + password form
- If TOTP required: second screen with 6-digit code input
- On success: redirect to /dashboard
- No "Register" link — admin accounts are seeded only
- Dark theme, Barblink branding

---

## 4. Redpanda Event Publishing (currently missing in all services)

Redpanda is running but no service publishes events. Fix this by wiring up producers in each service.

### Shared Kafka Producer (packages/shared-utils/src/events.ts)

```ts
import { Kafka } from 'kafkajs'

const kafka = new Kafka({ brokers: ['redpanda:9092'] })
const producer = kafka.producer()
await producer.connect()

export async function publishEvent(topic: string, payload: object): Promise<void> {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }) }]
  })
}
```

### Events to Publish (Phase 1)

Each service must publish these events after the relevant action:

| Service | Action | Topic | Payload |
|---|---|---|---|
| auth-service | User registered | `user.registered` | `{ userId, phone }` |
| checkin-service | User checks in | `user.checked_in` | `{ userId, venueId, checkinId }` |
| checkin-service | User checks out | `user.checked_out` | `{ userId, venueId, checkinId }` |
| social-service | Post created | `post.created` | `{ postId, userId, venueId? }` |
| social-service | Post liked | `post.liked` | `{ postId, likedByUserId, authorId }` |
| social-service | Comment added | `comment.created` | `{ postId, commentId, commenterId, authorId }` |
| social-service | Story created | `story.created` | `{ storyId, userId }` |
| user-service | Follow request sent | `friend.request_sent` | `{ fromUserId, toUserId }` |
| user-service | Follow accepted | `friend.request_accepted` | `{ fromUserId, toUserId }` |
| user-service | Home safe ping | `user.home_safe` | `{ userId, trustedCircleIds[] }` |
| venue-service | Venue created | `venue.created` | `{ venueId }` |
| scraper-service | Scrape success | `venue.scraped` | `{ venueId, djNames[], events[] }` |
| scraper-service | Scrape failed (3x) | `scraper.failed` | `{ venueId, venueName, source, failures }` |
| dj-service | DJ profile created | `dj.profile_created` | `{ djId, name }` |
| dj-service | DJ gig added | `dj.gig_added` | `{ djId, venueId, eventDate }` |
| events-service | User RSVPs | `event.rsvp` | `{ eventId, userId }` |

### Consumers (notification-service subscribes to all)

```ts
// notification-service subscribes to every topic above and sends the appropriate push/in-app notification
const consumer = kafka.consumer({ groupId: 'notification-service' })
await consumer.subscribe({ topics: ALL_TOPICS, fromBeginning: false })

await consumer.run({
  eachMessage: async ({ topic, message }) => {
    const payload = JSON.parse(message.value.toString())
    switch (topic) {
      case 'friend.request_sent':
        await sendPush(payload.toUserId, 'New follower request', `Someone wants to follow you`)
        await createInAppNotification(payload.toUserId, 'follow_request', payload)
        break
      case 'post.liked':
        await sendBatchedPush(payload.authorId, 'post_liked', payload) // batched — max 1 per post per hour
        break
      case 'user.home_safe':
        for (const friendId of payload.trustedCircleIds) {
          await sendPush(friendId, "They're home safe 🦉", `Your friend made it home`)
        }
        break
      case 'scraper.failed':
        await createAdminAlert(payload) // in-app alert for admin panel
        break
      // ... handle all other topics
    }
  }
})
```

---

## 5. Admin Panel — Settings Page (replace PlatformSetting with encrypted version)

The existing `PlatformSetting` table needs to be replaced with the `platform_settings` schema from Section 1 (with encryption + audit log).

### Settings Page in Admin Panel

**URL:** admin.barblink.com/settings

**Layout:**
- Category tabs: All | Email | SMS | Firebase | Storage | Search | Scraper | Platform
- Table per category:

| Key | Description | Value | Updated | Actions |
|---|---|---|---|---|
| MAILGUN_API_KEY | Mailgun API key | •••••••• 👁 | 2h ago by Admin | Edit |
| MAILGUN_DOMAIN | Sending domain | mg.barblink.com | 2h ago by Admin | Edit |

**Interactions:**
- 👁 icon: reveals value (calls GET /admin/settings/:key, writes audit log entry)
- Edit: inline input field, masked for secrets
- Save: PUT /admin/settings/:key, invalidates Redis cache
- "Test Connection" button per category tab (see below)
- "Add Setting" button: modal with key, value, description, category, isSecret

**Test Connection (per category):**
- Email: sends a test email to admin's own address via Mailgun
- SMS: sends a test SMS to admin's phone via Twilio
- Storage: attempts to list MinIO buckets
- Firebase: sends a test FCM push to a test token

**Warning banner:** "⚠️ Some changes (storage, search) require a service restart. Platform settings take effect immediately."

### Admin API Endpoints for Settings

```
GET    /admin/settings              All settings grouped by category (secrets masked)
GET    /admin/settings/:key         Single setting revealed (writes audit log)
POST   /admin/settings              Create setting
PUT    /admin/settings/:key         Update setting (invalidates Redis cache for cfg:{key})
DELETE /admin/settings/:key         Soft delete
POST   /admin/settings/test/:cat    Test connection for category
GET    /admin/settings/audit-log    Last 100 audit entries
```

---

## 6. Core Service Implementations (Phase 1)

### 6.1 auth-service (port 3001)

Refer to existing spec but with these fixes applied:
- Admin uses email+password (new `admin_accounts` table) — not phone OTP
- JWT has `role: 'user' | 'admin'` — no vendor/dj roles in Phase 1
- Rate limiting applied (see Section 2)
- User registration, OTP, login, Google OAuth, Apple OAuth unchanged

### 6.2 user-service (port 3002)

Publishes these Redpanda events:
- `friend.request_sent` on POST /users/:id/follow
- `friend.request_accepted` on PUT /users/requests/:id/accept
- `user.home_safe` on POST /users/me/home-safe

### 6.3 venue-service (port 3003)

Admin endpoints use `AdminGuard`.
Publishes `venue.created` on POST /admin/venues.
No vendor-facing endpoints in Phase 1.

### 6.4 discovery-service (port 3004)

No changes from existing spec. Uses `getConfig()` for Meilisearch credentials.

### 6.5 social-service (port 3005)

Publishes:
- `post.created` on POST /posts
- `post.liked` on POST /posts/:id/like
- `comment.created` on POST /posts/:id/comments
- `story.created` on POST /stories

### 6.6 checkin-service (port 3006)

Check-in is ONE TAP — no QR scanning, no GPS verification in Phase 1.
Publishes:
- `user.checked_in` on POST /checkins
- `user.checked_out` on DELETE /checkins/:id

### 6.7 notification-service (port 3008)

Subscribes to all Redpanda topics (see Section 4).
Uses `getConfig()` for Mailgun, Twilio, Firebase credentials at startup.

### 6.8 scraper-service (port 3009)

Uses `getConfig()` for Playwright settings at startup.
Publishes:
- `venue.scraped` on successful scrape
- `scraper.failed` after 3 consecutive failures for a venue

### 6.9 dj-service (port 3010)

Subscribes to `venue.scraped` to auto-create DJ profiles.
Publishes:
- `dj.profile_created` when new profile auto-created
- `dj.gig_added` when new event linked to DJ

### 6.10 events-service (port 3011)

Publishes `event.rsvp` on POST /events/:id/rsvp.

### 6.11 community-service (port 3012)

Subscribes to `user.checked_in` to update streaks, badges, and leaderboard scores.

### 6.12 chat-service (port 3007)

No Redpanda events — real-time delivery via Socket.io directly.

---

## 7. Docker Compose — Phase 1

Each service only receives bootstrap secrets from `.env`. All other credentials fetched at runtime from `platform_settings` via `getConfig()`.

```yaml
version: '3.8'

services:
  # ── Infrastructure ──────────────────────────────────────────────
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: barblink
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-databases.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data

  redpanda:
    image: redpandadata/redpanda:latest
    command: >
      redpanda start
      --kafka-addr internal://0.0.0.0:9092
      --advertise-kafka-addr internal://redpanda:9092
    volumes:
      - redpanda_data:/var/lib/redpanda/data

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: barblink
      MINIO_ROOT_PASSWORD: ${DB_PASSWORD}
    volumes:
      - minio_data:/data

  meilisearch:
    image: getmeili/meilisearch:latest
    volumes:
      - meili_data:/meili_data

  # ── Services — all get the same 4 bootstrap vars ────────────────
  # DATABASE_URL, REDIS_URL, JWT_SECRET, NODE_ENV
  # Everything else via getConfig() from platform_settings table

  auth-service:
    build: ../../services/auth-service
    environment:
      DATABASE_URL: postgresql://barblink:${DB_PASSWORD}@postgres:5432/barblink_auth
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      SETTINGS_ENCRYPTION_KEY: ${SETTINGS_ENCRYPTION_KEY}
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_INITIAL_PASSWORD: ${ADMIN_INITIAL_PASSWORD}
      ADMIN_NAME: ${ADMIN_NAME}
      NODE_ENV: ${NODE_ENV}
    depends_on: [postgres, redis]
    ports: ["3001:3001"]

  user-service:
    build: ../../services/user-service
    environment:
      DATABASE_URL: postgresql://barblink:${DB_PASSWORD}@postgres:5432/barblink_users
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      SETTINGS_ENCRYPTION_KEY: ${SETTINGS_ENCRYPTION_KEY}
      REDPANDA_BROKERS: redpanda:9092
      NODE_ENV: ${NODE_ENV}
    depends_on: [postgres, redis, redpanda]
    ports: ["3002:3002"]

  # All remaining services follow the same 4-variable pattern:
  # DATABASE_URL, REDIS_URL, JWT_SECRET, NODE_ENV
  # Plus: SETTINGS_ENCRYPTION_KEY, REDPANDA_BROKERS where needed

  venue-service:
    build: ../../services/venue-service
    environment:
      DATABASE_URL: postgresql://barblink:${DB_PASSWORD}@postgres:5432/barblink_venues
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      SETTINGS_ENCRYPTION_KEY: ${SETTINGS_ENCRYPTION_KEY}
      REDPANDA_BROKERS: redpanda:9092
      NODE_ENV: ${NODE_ENV}
    depends_on: [postgres, redis, redpanda]
    ports: ["3003:3003"]

  discovery-service:
    build: ../../services/discovery-service
    environment:
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      SETTINGS_ENCRYPTION_KEY: ${SETTINGS_ENCRYPTION_KEY}
      NODE_ENV: ${NODE_ENV}
    depends_on: [redis]
    ports: ["3004:3004"]

  social-service:
    build: ../../services/social-service
    environment:
      DATABASE_URL: postgresql://barblink:${DB_PASSWORD}@postgres:5432/barblink_social
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      SETTINGS_ENCRYPTION_KEY: ${SETTINGS_ENCRYPTION_KEY}
      REDPANDA_BROKERS: redpanda:9092
      NODE_ENV: ${NODE_ENV}
    depends_on: [postgres, redis, redpanda]
    ports: ["3005:3005"]

  checkin-service:
    build: ../../services/checkin-service
    environment:
      DATABASE_URL: postgresql://barblink:${DB_PASSWORD}@postgres:5432/barblink_checkins
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      SETTINGS_ENCRYPTION_KEY: ${SETTINGS_ENCRYPTION_KEY}
      REDPANDA_BROKERS: redpanda:9092
      NODE_ENV: ${NODE_ENV}
    depends_on: [postgres, redis, redpanda]
    ports: ["3006:3006"]

  chat-service:
    build: ../../services/chat-service
    environment:
      DATABASE_URL: postgresql://barblink:${DB_PASSWORD}@postgres:5432/barblink_chat
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: ${NODE_ENV}
    depends_on: [postgres, redis]
    ports: ["3007:3007"]

  notification-service:
    build: ../../services/notification-service
    environment:
      DATABASE_URL: postgresql://barblink:${DB_PASSWORD}@postgres:5432/barblink_notifications
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      SETTINGS_ENCRYPTION_KEY: ${SETTINGS_ENCRYPTION_KEY}
      REDPANDA_BROKERS: redpanda:9092
      NODE_ENV: ${NODE_ENV}
    depends_on: [postgres, redis, redpanda]
    ports: ["3008:3008"]

  scraper-service:
    build: ../../services/scraper-service
    environment:
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      SETTINGS_ENCRYPTION_KEY: ${SETTINGS_ENCRYPTION_KEY}
      REDPANDA_BROKERS: redpanda:9092
      NODE_ENV: ${NODE_ENV}
    depends_on: [redis, redpanda]
    ports: ["3009:3009"]

  dj-service:
    build: ../../services/dj-service
    environment:
      DATABASE_URL: postgresql://barblink:${DB_PASSWORD}@postgres:5432/barblink_djs
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      SETTINGS_ENCRYPTION_KEY: ${SETTINGS_ENCRYPTION_KEY}
      REDPANDA_BROKERS: redpanda:9092
      NODE_ENV: ${NODE_ENV}
    depends_on: [postgres, redis, redpanda]
    ports: ["3010:3010"]

  events-service:
    build: ../../services/events-service
    environment:
      DATABASE_URL: postgresql://barblink:${DB_PASSWORD}@postgres:5432/barblink_events
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      SETTINGS_ENCRYPTION_KEY: ${SETTINGS_ENCRYPTION_KEY}
      REDPANDA_BROKERS: redpanda:9092
      NODE_ENV: ${NODE_ENV}
    depends_on: [postgres, redis, redpanda]
    ports: ["3011:3011"]

  community-service:
    build: ../../services/community-service
    environment:
      DATABASE_URL: postgresql://barblink:${DB_PASSWORD}@postgres:5432/barblink_community
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      SETTINGS_ENCRYPTION_KEY: ${SETTINGS_ENCRYPTION_KEY}
      REDPANDA_BROKERS: redpanda:9092
      NODE_ENV: ${NODE_ENV}
    depends_on: [postgres, redis, redpanda]
    ports: ["3012:3012"]

  # ── Front-ends ───────────────────────────────────────────────────
  admin-app:
    build: ../../apps/admin
    environment:
      NEXT_PUBLIC_API_URL: https://api.barblink.com/v1
      NODE_ENV: ${NODE_ENV}
    ports: ["3200:3200"]

  landing-app:
    build: ../../apps/landing
    environment:
      NEXT_PUBLIC_API_URL: https://api.barblink.com/v1
      NODE_ENV: ${NODE_ENV}
    ports: ["3000:3000"]

volumes:
  postgres_data:
  redis_data:
  redpanda_data:
  minio_data:
  meili_data:
```

### init-databases.sql

```sql
CREATE DATABASE barblink_auth;
CREATE DATABASE barblink_users;
CREATE DATABASE barblink_venues;
CREATE DATABASE barblink_social;
CREATE DATABASE barblink_checkins;
CREATE DATABASE barblink_chat;
CREATE DATABASE barblink_notifications;
CREATE DATABASE barblink_djs;
CREATE DATABASE barblink_events;
CREATE DATABASE barblink_community;
CREATE DATABASE barblink_admin;   -- platform_settings + admin_accounts + audit logs
```

---

## 8. Phase 1 Build Order

Build and verify each step before moving to the next:

1. **Infrastructure** — `docker compose up` — Postgres, Redis, Redpanda, MinIO, Meilisearch all healthy
2. **init-databases.sql** — all 11 databases created
3. **packages/shared-types** — all entity interfaces including updated `JwtPayload`
4. **packages/shared-utils** — `getConfig()`, `publishEvent()`, `RateLimitGuard`, response helpers
5. **auth-service** — user auth + new admin email/password auth + first-run admin seed
6. **Admin login page** — admin.barblink.com/login (email+password, TOTP screen)
7. **venue-service** — platform_settings table + getConfig() wired in + Settings admin page
8. **user-service** + Redpanda events wired
9. **notification-service** — Redpanda consumer + Mailgun/Twilio/FCM via getConfig()
10. **scraper-service** — Playwright Instagram + Google + BullMQ scheduler
11. **discovery-service** — Meilisearch via getConfig()
12. **checkin-service** — one-tap, Redis crowd counter, Socket.io
13. **social-service** + Redpanda events wired
14. **dj-service** — auto-profile from scraper events + Redpanda consumer
15. **events-service**
16. **community-service** — streaks, badges, leaderboard (Redpanda consumer)
17. **chat-service** — Socket.io DMs
18. **Nginx** — wire all services, admin subdomain
19. **landing-app** — barblink.com waitlist page

---

# PHASE 2 — POST 1,000 DAU (do not build yet)

The following are fully designed but must NOT be built until the platform reaches 1,000 DAU:

**Vendor Portal (venue.barblink.com)**
- Vendor registration and login
- `vendor_accounts` table in auth-service
- JWT role: `vendor`
- Venue dashboard for owners: edit description, view reviews, see check-in stats
- Application approval flow in admin panel

**DJ Portal (dj.barblink.com)**
- DJ registration, login, profile claim flow
- `dj_accounts` table in auth-service
- JWT role: `dj`
- DJ dashboard: manage events, view ratings, see followers
- Claim existing auto-generated profile
- Application approval flow in admin panel

**Table Reservations**
**In-App Drink Ordering**
**Payments (Stripe + Billplz)**
**Premium Subscriptions**
**Bar Buddy Matching**
**Venue Self-Onboarding**
**Ads Platform**

When building Phase 2, refer to the previous version of this doc for the full vendor/DJ auth and portal specifications.
