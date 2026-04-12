# Barblink — Build Gap Analysis
**Date:** April 12, 2026
**Build Status:** Feature-complete foundation ✅ — social features partially complete
**Repo:** https://github.com/ddrdushy/BarBlink

---

## What's Solid ✅

Everything below is built, wired to real backends, and working:

- Full monorepo with Turborepo — 12 NestJS services running in Docker
- PostgreSQL (PostGIS), Redis, Redpanda, MinIO, Meilisearch all running
- CI/CD (GitHub Actions), Monitoring (Grafana + Prometheus + Loki + cAdvisor)
- Auth flow — register, 18+ gate, OTP, JWT, admin email+password login
- Admin panel — 13 pages, dashboard, scraper management, venue/DJ/event management
- Landing page — particle canvas, waitlist form
- 55 seeded venues (35 KL + 20 Colombo)
- Photo upload to MinIO
- Basic posts, likes, comments, feed
- One-tap check-in with crowd counter
- DJ profiles and events
- Community service — streaks and badges
- Chat — conversations and messages
- Notifications — in-app + FCM device tokens registered
- Scraper — Playwright Instagram + Google, 12hr schedule
- Multi-country support (MY + LK) — not in original docs but good addition

---

## Gaps vs Docs — Priority Order

---

### 🔴 CRITICAL — Core social features missing

#### 1. Stories (not built)
**Doc ref:** `02-features-social.md` — Stories section
- Stories table not created, no POST /stories endpoint
- No 24hr expiry mechanism
- No story strip in feed
- No story viewer screen in mobile app
- No story_views tracking

**What to build:**
- `stories` + `story_views` tables in social-service DB (schema in `06-database-schema.md`)
- POST /stories, GET /stories, POST /stories/:id/view endpoints
- 24hr expiry via cron job or Redis TTL
- Story strip component at top of Blink Feed
- Story viewer screen (full-screen, tap to next)
- Neon purple ring on unseen stories

---

#### 2. Blink Feed layout not implemented
**Doc ref:** `02-features-social.md` — Home Feed section
The feed exists but shows a standard chronological post list. The unique Blink Feed layout is missing:
- ❌ Hero card (first item always full-width, cinematic)
- ❌ Check-in cards shown separately in 2-column compact layout (completely different design from posts)
- ❌ Stories strip at top of feed
- ❌ Content interleaving logic (posts → checkin pair → post → repeat)
- ❌ Check-in cards show friend's venue with crowd colour indicator

**What to build:**
- Feed algorithm interleaving in social-service (Section 5 of CLAUDE-backend.md)
- Hero card component
- Check-in card component (compact, 2-column, neon purple venue name, crowd dot)
- Interleaved rendering logic in mobile feed screen

---

#### 3. "Who's Out Tonight" strip missing
**Doc ref:** `02-features-social.md` — Check-in section
- No horizontal strip on home screen showing friends currently checked in
- GET /checkins/active endpoint exists but not surfaced in the feed UI

---

#### 4. Check-in reactions missing
**Doc ref:** `02-features-social.md` — Posts & Content Creation
- `checkin_reactions` table not created
- No quick emoji react to a friend's check-in
- POST /checkins/:id/react endpoint missing

---

#### 5. Redpanda events — incomplete
**Doc ref:** `CLAUDE-backend.md` — Section 4 (Redpanda Event Publishing)
Only 3 topics are published:
- ✅ `post.created`
- ✅ `user.checked_in`
- ✅ `friend.request_sent`

Missing (13 topics not published):
- ❌ `user.registered`
- ❌ `user.checked_out`
- ❌ `post.liked`
- ❌ `comment.created`
- ❌ `story.created`
- ❌ `friend.request_accepted`
- ❌ `user.home_safe`
- ❌ `venue.created`
- ❌ `venue.scraped`
- ❌ `scraper.failed`
- ❌ `dj.profile_created`
- ❌ `dj.gig_added`
- ❌ `event.rsvp`

notification-service is likely only handling 3 notification types as a result.

---

### 🟠 HIGH — Social features not built

#### 6. Poll posts not built
**Doc ref:** `02-features-social.md` — Posts & Content Creation
- `poll_options` JSONB field missing from posts table
- `poll_votes` table not created
- POST /posts (type: poll) not implemented
- Poll voting UI missing in mobile
- Poll results display missing

#### 7. Drink rating posts not built
**Doc ref:** `02-features-social.md` — Posts & Content Creation
- `drink_name` and `drink_rating` fields missing from posts schema
- No UI to create a drink rating post
- No drink rating badge on post cards

#### 8. Repost / re-share not built
**Doc ref:** `02-features-social.md` — Posts & Content Creation
- `original_post_id` field missing from posts schema
- No repost flow in mobile app
- POST /posts (type: repost) not implemented

#### 9. Bookmark / save posts not built
**Doc ref:** `02-features-social.md` — Posts & Content Creation
- `bookmarks` table not created
- No bookmark button on post cards
- POST/DELETE /users/bookmarks/:postId not implemented
- No saved posts screen in profile

#### 10. Night recap not built
**Doc ref:** `02-features-social.md` — Posts & Content Creation
- Auto-generated end-of-night memory card
- Requires: query check-ins + tagged photos from same night, compile into a recap post
- Cron job trigger (e.g. 3AM MYT)

#### 11. "Going Tonight" status not built
**Doc ref:** `02-features-social.md` — Going Out section
- `going_tonight` and `going_venue_id` fields missing from profiles table
- POST /users/me/going-tonight endpoint missing
- No "Going Tonight" badge on user profiles
- No "Who's Joining Me?" post flow
- Auto-reset cron at 6AM MYT missing

#### 12. "I'm Home Safe" ping not built
**Doc ref:** `02-features-social.md` — Safety Features
- `is_home_safe` field missing from profiles
- POST /users/me/home-safe endpoint missing
- `user.home_safe` Redpanda event not published
- No trusted circle notification

#### 13. Trusted circle not built
**Doc ref:** `02-features-social.md` — Safety Features
- `trusted_circle` table not created
- GET/POST/DELETE /users/me/trusted-circle endpoints missing
- No trusted circle management screen in mobile

---

### 🟡 MEDIUM — Discovery & community features

#### 14. QR code connect not built
**Doc ref:** `02-features-social.md` — Finding Friends
- `qr_codes` table not created
- GET /users/me/qr endpoint missing
- POST /users/qr/connect endpoint missing
- No QR display screen in profile
- No QR scanner in mobile app

#### 15. People You May Know not built
**Doc ref:** `02-features-social.md` — Finding Friends
- GET /users/suggestions endpoint missing
- 2nd-degree connection logic not implemented
- No suggestions screen in mobile

#### 16. Nightlife Passport not built
**Doc ref:** `02-features-social.md` — Discovery & Gamification
- No venue map on user profile
- GET /users/:id/passport endpoint missing
- No "venues visited" map component in profile screen

#### 17. Venue Collections not built
**Doc ref:** `02-features-social.md` — Discovery & Gamification
- `venue_collections` + `venue_collection_items` tables may be missing
- CRUD endpoints for collections missing
- No collections screen in mobile or profile

#### 18. Weekly Leaderboard — partial
**Doc ref:** `02-features-social.md` — Discovery & Gamification
- Leaderboard page in admin — "Partial (tries community-service)"
- `weekly_leaderboard` table needs confirming
- Neighbourhood sub-leaderboards missing
- No leaderboard screen in mobile app
- Weekly reset cron (Monday 00:01 MYT) — needs confirming

#### 19. Neighbourhood Groups not built
**Doc ref:** `02-features-social.md` — Community section
- `neighbourhood_groups` table not created
- GET /neighbourhoods, GET /neighbourhoods/:area/feed missing
- No neighbourhood feed screen in mobile

#### 20. Venue follow not built
**Doc ref:** `03-features-venue.md` — Venue Page
- No venue follow/unfollow
- No followed venues appearing in feed
- POST/DELETE /venues/:id/follow endpoints missing
- Venue posts not appearing in feed of followers

#### 21. Venue reviews (Barblink) not built
**Doc ref:** `03-features-venue.md` — Venue Reviews
- `venue_reviews` table in venue-service — needs confirming
- POST /venues/:id/reviews endpoint
- Rating categories (drinks, food, music, atmosphere, sound, service)
- Review form after check-in
- Reviews visible on venue detail page

#### 22. DJ ratings not built
**Doc ref:** `02-features-social.md` — DJ Profiles
- `dj_ratings` table missing
- POST /djs/:id/rate endpoint missing
- Rating only unlocked after attending event (check-in validation)
- No rating UI in mobile

#### 23. Setlist posting not built
**Doc ref:** `02-features-social.md` — DJ Profiles
- `setlists` table missing
- POST /djs/:id/setlist endpoint missing
- No setlist UI in mobile

---

### 🟢 LOW — Admin panel gaps

#### 24. Reports queue — mock only
**Doc ref:** `04-features-admin.md` — Reports section
- Reports page layout exists but no backend
- No `reports` table in any service
- POST endpoint for submitting a report missing
- No moderation queue backend
- Admin cannot action reports

**What to add:**
- `reports` table in social-service:
```sql
reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  content_type ENUM('post','comment','user') NOT NULL,
  content_id  UUID NOT NULL,
  reason      VARCHAR(50) NOT NULL,
  status      ENUM('pending','actioned') DEFAULT 'pending',
  action_taken VARCHAR(50),
  actioned_by UUID,
  created_at  TIMESTAMPTZ DEFAULT NOW()
)
```
- POST /reports — submit a report
- GET /admin/reports — get queue
- PUT /admin/reports/:id — action a report

#### 25. Waitlist page — mock only
**Doc ref:** `09-landing-page.md`
- Waitlist page in admin shows mock data
- POST /notifications/waitlist endpoint — needs confirming if actually saving to DB
- GET /admin/waitlist endpoint missing
- Export CSV missing
- Send launch email blast missing
- `waitlist_emails` table — needs confirming

#### 26. Platform settings not encrypted
**Doc ref:** `CLAUDE-backend.md` — Section 1
- Settings page exists (5 integration sections)
- But uses `PlatformSetting` model without AES-256-GCM encryption
- No `settings_audit_log` table
- No "Reveal" audit logging
- No "Test Connection" per category
- Need to migrate to encrypted `platform_settings` table

#### 27. Analytics charts — mock
**Doc ref:** `04-features-admin.md` — Analytics page
- Stats real, charts are mock data
- DAU chart needs real data from auth-service (daily login counts)
- Engagement bars need real data from social + checkin services
- Top venues table needs real data from checkin-service

---

### 🔵 NOTE — Undocumented additions (good, keep them)

These are in the build but NOT in our docs — they're good additions:

| Feature | Status | Action |
|---|---|---|
| Colombo (Sri Lanka) venues (20) | Built | Update docs to reflect MY + LK scope |
| Multi-country phone validation | Built | Update docs |
| Dev bypass (OTP 123456) | Built | Keep for dev, remove for production |
| cAdvisor container metrics | Built | Update monitoring docs |
| PostGIS on Postgres | Built | Update database schema docs |
| Country field on profiles | Built | Update user schema in docs |

---

## Prioritised Build Queue

Based on the gaps above, here is the recommended order for what to build next:

### Sprint 1 — Complete the Feed (most visible to users)
1. Stories (table, endpoints, strip in feed, viewer screen)
2. Blink Feed layout (hero card, check-in cards, interleaving)
3. "Who's Out Tonight" strip
4. Check-in reactions (emoji react)

### Sprint 2 — Complete the Social Graph
5. "Going Tonight" status
6. Trusted circle + "I'm Home Safe"
7. QR code connect
8. People You May Know suggestions
9. Venue follow + venue posts in feed

### Sprint 3 — Complete Post Types
10. Drink rating posts
11. Poll posts + voting
12. Repost / re-share
13. Bookmarks
14. Check-in reactions

### Sprint 4 — Complete Redpanda Events
15. Wire all 16 missing Redpanda event topics
16. notification-service — consume all topics, send appropriate notifications

### Sprint 5 — Community & Discovery
17. Nightlife Passport (venue map on profile)
18. Venue Collections
19. Weekly Leaderboard (mobile screen + reset cron)
20. Neighbourhood Groups

### Sprint 6 — Venue & DJ features
21. Venue reviews (Barblink ratings)
22. DJ ratings (post-checkin)
23. Setlist posting

### Sprint 7 — Admin completeness
24. Reports queue backend (table + endpoints + admin actions)
25. Waitlist backend (confirm table, wire export + email blast)
26. Encrypt platform settings + audit log
27. Fix analytics charts with real data

### Sprint 8 — Night Recap (complex, do last)
28. Night recap auto-generation (cron + compile logic)

---

## Doc Updates Needed

Update these docs to match what's actually been built:

| Doc | What to update |
|---|---|
| `01-project-overview.md` | Add Colombo / Sri Lanka to target markets |
| `05-tech-stack.md` | Add PostGIS, cAdvisor |
| `06-database-schema.md` | Add country field to profiles, update to match actual Prisma schemas |
| `08-build-order.md` | Mark completed phases |
| `CLAUDE-backend.md` | Note dev bypass OTP, note Colombo venues |

---

## Current Status Summary

| Area | % Complete |
|---|---|
| Infrastructure & DevOps | 95% |
| Auth & User Accounts | 80% |
| Venue Discovery | 75% |
| Check-in System | 85% |
| Social Feed (structure) | 50% |
| Social Feed (post types) | 30% |
| Stories | 0% |
| Friends & Social Graph | 60% |
| Safety Features | 0% |
| DJ Profiles | 65% |
| Events | 70% |
| Community / Gamification | 45% |
| Chat | 80% |
| Notifications | 55% |
| Admin Panel | 70% |
| Landing Page | 90% |
| **Overall** | **~62%** |
