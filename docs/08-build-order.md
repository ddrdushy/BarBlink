# 08 — Build Order

Follow this exact sequence. Each phase must be working and testable before moving to the next.

---

## Phase 0 — Monorepo Setup

```bash
npx create-turbo@latest barblink
cd barblink

# Apps
mkdir -p apps/mobile
mkdir -p apps/admin
mkdir -p apps/landing

# Services
mkdir -p services/auth-service
mkdir -p services/user-service
mkdir -p services/venue-service
mkdir -p services/discovery-service
mkdir -p services/social-service
mkdir -p services/checkin-service
mkdir -p services/chat-service
mkdir -p services/notification-service
mkdir -p services/scraper-service
mkdir -p services/dj-service
mkdir -p services/events-service
mkdir -p services/community-service

# Shared packages
mkdir -p packages/shared-types
mkdir -p packages/shared-utils
mkdir -p packages/ui-components
mkdir -p packages/api-client

# Infrastructure
mkdir -p infrastructure/docker
mkdir -p infrastructure/nginx
mkdir -p infrastructure/coolify
```

**Checklist:**
- [ ] Turborepo initialised with pnpm workspaces
- [ ] `packages/shared-types` — base TypeScript interfaces for all entities
- [ ] `packages/shared-utils` — date helpers, GPS utils, Malaysian phone validation
- [ ] Docker Compose file with: PostgreSQL, Redis, Redpanda, MinIO, Meilisearch
- [ ] `.env.example` with all variables
- [ ] GitHub repo connected + GitHub Actions CI workflow

**Milestone:** `pnpm dev` starts all infrastructure containers cleanly.

---

## Phase 1 — Auth & User Foundation

**Goal:** User can register, pass 18+ age gate, verify phone OTP, and log in.

**Services:**
- [ ] `auth-service` — register (DOB 18+ validation), send-otp, verify-otp, login, JWT + refresh tokens
- [ ] `user-service` — profile CRUD, follow system, QR code generation, trusted circle

**Mobile App:**
- [ ] Splash screen (Barblink logo + owl mascot)
- [ ] Welcome screen (Sign Up / Log In)
- [ ] **Age gate screen** — date picker, blocks under 18 immediately
- [ ] Phone number entry screen
- [ ] OTP verification screen
- [ ] Profile setup screen (photo, username, drink preferences)
- [ ] T&C consent screen
- [ ] Login screen
- [ ] Bottom tab navigation (5 tabs: Feed, Discover, Check-in, Chat, Profile)
- [ ] Home screen placeholder

**Milestone:** User registers on mobile, passes age gate, verifies OTP, sets up profile, reaches home screen.

---

## Phase 2 — Landing Page & Waitlist

**Goal:** barblink.com is live with waitlist signup.

**Apps:**
- [ ] `apps/landing` — Next.js 14 static site
  - [ ] Hero section with video background and "Blink, You're In" tagline
  - [ ] Waitlist email signup form
  - [ ] Feature highlights section
  - [ ] DJ discovery teaser section
  - [ ] App screenshots section
  - [ ] Footer with social links
  - [ ] Deployed to VPS via Coolify
  - [ ] SSL via Let's Encrypt
  - [ ] barblink.com pointing to VPS

**Services:**
- [ ] `notification-service` — waitlist endpoint + Mailgun welcome email on signup

**Milestone:** User visits barblink.com, enters email, receives branded welcome email from Mailgun.

---

## Phase 3 — Venue Profiles & Scraper

**Goal:** Admin can add a bar by pasting its Instagram URL. Profile auto-populates.

**Services:**
- [ ] `venue-service` — venue CRUD, photos, reviews, hours, scraper sync log
- [ ] `scraper-service` — Playwright Instagram scraper + Google scraper, 12hr scheduler, failure handling, retry logic, admin alerts

**Admin Panel (basic):**
- [ ] `apps/admin` — Next.js 14 web app at admin.barblink.com
  - [ ] Login with admin credentials + 2FA
  - [ ] Add venue form (paste Instagram URL → triggers scrape)
  - [ ] Venue list table (name, area, last sync, status)
  - [ ] Edit venue page (manual field overrides)
  - [ ] Scraper status dashboard (per venue health, failure alerts)
  - [ ] Manual re-scrape trigger buttons

**Milestone:** Admin adds Zouk KL via Instagram URL. Profile populates with photos, bio, hours, GPS from Google. Venue appears in app.

---

## Phase 4 — Venue Discovery

**Goal:** Users can browse and search venues on a map and list.

**Services:**
- [ ] `discovery-service` — Meilisearch integration, nearby venues (lat/lng + radius), filters, crowd meter from Redis

**Mobile App:**
- [ ] Discover tab — map view (OpenStreetMap + react-native-maps)
- [ ] Map pins with crowd colour indicators (green / amber / red)
- [ ] Friend avatars on map for checked-in friends
- [ ] Discover tab — list view
- [ ] Venue card component (name, category, crowd meter, closing time, friend count)
- [ ] Filter bottom sheet (genre, open now, distance, price, DJ tonight)
- [ ] Venue detail page (full info, photos, reviews, tonight's DJ)
- [ ] Follow venue button

**Seed data:** 20 KL venues seeded with real data.

**Milestone:** User opens app, sees KL clubs on map, filters by EDM, taps venue, sees full profile.

---

## Phase 5 — Check-In System

**Goal:** Users can check in. Crowd meter updates live.

**Services:**
- [ ] `checkin-service` — solo check-in (GPS validation), group check-in, Redis crowd counter, Socket.io broadcast, QR code generation

**Mobile App:**
- [ ] Check In button on venue page
- [ ] GPS confirmation overlay
- [ ] Check-in success animation screen
- [ ] "Who's Out Tonight" strip on home feed
- [ ] Group check-in creation and join flow

**Milestone:** User checks in to a venue. Crowd meter updates in real-time. Friends see check-in in their feed.

---

## Phase 6 — Social Feed

**Goal:** Users can post, see friends' posts and check-ins in a unique feed layout.

**Services:**
- [ ] `social-service` — posts CRUD, stories (24hr expiry), feed algorithm (friends + followed venues), likes, comments, reposts, bookmarks, check-in reactions

**Mobile App:**
- [ ] Home feed — Blink Feed layout:
  - [ ] Stories strip (horizontal scroll, neon ring, live dot)
  - [ ] Hero post card (full-width, cinematic)
  - [ ] Check-in cards (compact, 2-column, different design)
  - [ ] Bar Buddy activity card design
- [ ] Post creation screen (photo/video + caption + venue tag + friend tag)
- [ ] Drink rating post flow
- [ ] Poll post creation
- [ ] Story creation and viewer
- [ ] Like, comment, react interactions
- [ ] Bookmark posts
- [ ] Repost flow
- [ ] Night recap generation (end of night auto-card)

**Milestone:** User posts a photo tagging a venue. Friend sees it as hero card in their Blink Feed.

---

## Phase 7 — Friends & Chat

**Goal:** Full friends system and real-time chat.

**Services:**
- [ ] `user-service` — search users, QR connect, People You May Know, going tonight status, I'm Home Safe, trusted circle
- [ ] `chat-service` — DMs, group chats, message reactions, share post/venue in chat (Socket.io)
- [ ] `notification-service` — FCM push for friend requests, messages, reactions

**Mobile App:**
- [ ] Search friends screen (by name, username, phone)
- [ ] QR code display screen (for in-person connect)
- [ ] QR code scanner screen
- [ ] People You May Know screen
- [ ] Follow request notifications
- [ ] Going Tonight status toggle on profile
- [ ] Who's Joining Me? post flow
- [ ] Trusted circle management screen
- [ ] I'm Home Safe button
- [ ] Chat tab — conversation list
- [ ] Chat screen — messages, reactions, share venue/post
- [ ] Group chat creation

**Milestone:** User scans friend's QR at a bar. Follow request sent. Chat opens. Message delivered in real-time.

---

## Phase 8 — DJ Profiles & Events

**Goal:** DJ profiles auto-created from venue scrape. Events feed live.

**Services:**
- [ ] `dj-service` — DJ/band profile CRUD, auto-creation from scrape, events calendar, follows, ratings, setlists
- [ ] `events-service` — events feed (What's On Tonight), RSVP, countdowns
- [ ] Update `scraper-service` — extract DJ names and event details from Instagram captions, trigger DJ auto-profile creation

**Mobile App:**
- [ ] DJ/band profile page
- [ ] Search DJs by name and genre
- [ ] Who's Hot This Week screen
- [ ] Follow DJ / get notified of upcoming gigs
- [ ] My followed DJs' calendar screen
- [ ] DJ rating screen (after attending event)
- [ ] Setlist posting screen
- [ ] What's On Tonight events feed screen
- [ ] Event detail page with RSVP
- [ ] Event countdown on venue page

**Admin Panel:**
- [ ] DJ/band profile list
- [ ] Edit DJ profile (merge duplicates)

**Milestone:** Admin adds a venue. Scraper pulls DJ names from Instagram posts. DJ profiles auto-created. Users can search and follow DJs.

---

## Phase 9 — Community & Gamification

**Goal:** Streaks, badges, leaderboards, venue collections, neighbourhood groups.

**Services:**
- [ ] `community-service` — streaks, badges, weekly leaderboard, venue collections, neighbourhood groups

**Mobile App:**
- [ ] Nightlife passport (venue map on profile)
- [ ] Streak counter and badges on profile
- [ ] Venue collections — create, view, share
- [ ] Weekly leaderboard screen
- [ ] Neighbourhood group feeds
- [ ] Barblink Verified Regular badge display on profiles and venue pages

**Milestone:** User's 7-night streak earns a badge. They appear on the Bukit Bintang weekly leaderboard.

---

## Phase 10 — Admin Panel (Full)

**Goal:** Full admin control over platform.

**Admin Panel:**
- [ ] Platform health dashboard (DAU, check-ins, new users, scraper health)
- [ ] DAU progress bar toward 1,000 DAU goal
- [ ] User management (list, view, suspend, ban)
- [ ] Reported content moderation queue
- [ ] Waitlist management (view, export CSV, send launch email blast)
- [ ] Content reports actioning

**Milestone:** Admin can see real-time DAU, manage users, and action content reports from one dashboard.

---

## Phase 11 — Launch Prep

- [ ] Coolify production deployment — single Hetzner CX31 VPS configured
- [ ] Cloudflare DNS + CDN setup for barblink.com and api.barblink.com
- [ ] SSL certificates via Let's Encrypt (auto via Coolify)
- [ ] Grafana + Prometheus monitoring dashboards
- [ ] Grafana Loki centralised logging
- [ ] Load testing — minimum 1,000 concurrent users
- [ ] 50 KL venues onboarded and verified
- [ ] Beta test with 100 users in KL
- [ ] Apple Developer Account ($99/yr) created
- [ ] Google Play Developer Account ($25) created
- [ ] App Store listing prepared (screenshots, description, preview video)
- [ ] Play Store listing prepared
- [ ] Privacy policy page live at barblink.com/privacy
- [ ] App submitted to App Store (17+ age rating)
- [ ] App submitted to Play Store
- [ ] Launch email sent to full waitlist via Mailgun

---

## Status Tracker

```
Phase 0  — Monorepo Setup         [ ] Not started
Phase 1  — Auth & Users           [ ] Not started
Phase 2  — Landing Page           [ ] Not started
Phase 3  — Venue Profiles         [ ] Not started
Phase 4  — Venue Discovery        [ ] Not started
Phase 5  — Check-In               [ ] Not started
Phase 6  — Social Feed            [ ] Not started
Phase 7  — Friends & Chat         [ ] Not started
Phase 8  — DJ Profiles & Events   [ ] Not started
Phase 9  — Community              [ ] Not started
Phase 10 — Admin Panel (Full)     [ ] Not started
Phase 11 — Launch Prep            [ ] Not started
```
