# Claude Code Instructions — Enterprise RBAC, Vendor & DJ Portals

## What This Doc Covers

This document specifies the full enterprise-grade role system, access control, vendor portal, DJ portal, and the corrected venue creation flow (Instagram URL required for scraping).

Read `CLAUDE-backend.md`, `docs/05-tech-stack.md`, and `docs/06-database-schema.md` before starting.

---

## Current State vs What's Needed

| Area | Current State | What's Needed |
|---|---|---|
| Roles | `user` and `admin` only | 4 roles: `user`, `admin`, `vendor`, `dj` |
| Access control | No RBAC — endpoints unprotected | Full RBAC with permission guards per endpoint |
| Admin portal | Built, working | Add vendor/DJ application management |
| Vendor portal | Nothing built | Full registration + login + dashboard |
| DJ portal | Nothing built | Full registration + login + claim + dashboard |
| Venue creation | No Instagram URL enforcement | Instagram URL required — scrape triggers on save |
| Venue editing | Admin edits everything | Vendors can edit only their own venue's allowed fields |
| DJ editing | Admin edits everything | DJs can edit only their own profile's allowed fields |

---

## 1. RBAC — Role-Based Access Control

### Four Roles

| Role | Who | Portal | JWT |
|---|---|---|---|
| `user` | Regular app users (18+) | Mobile app | Short-lived (15min) + refresh |
| `admin` | Barblink platform staff | admin.barblink.com | 24hr, email+password+TOTP |
| `vendor` | Bar/club owners | venue.barblink.com | 8hr, email+password |
| `dj` | DJs and live bands | dj.barblink.com | 8hr, email+password |

### JWT Payload

```ts
interface JwtPayload {
  sub: string              // account ID (from respective accounts table)
  role: 'user' | 'admin' | 'vendor' | 'dj'
  venueId?: string         // vendor only — the venue they manage
  djProfileId?: string     // dj only — the DJ profile they own
  country?: string         // user only — MY or LK
  iat: number
  exp: number
}
```

### Guards (NestJS)

Create these guards in `packages/shared-utils/src/guards/`:

```ts
// jwt-auth.guard.ts — any valid JWT (any role)
// user.guard.ts — role must be 'user'
// admin.guard.ts — role must be 'admin'
// vendor.guard.ts — role must be 'vendor'
// dj.guard.ts — role must be 'dj'
// admin-or-vendor.guard.ts — role must be 'admin' OR 'vendor'
// admin-or-dj.guard.ts — role must be 'admin' OR 'dj'
// any-portal.guard.ts — role must be 'admin' OR 'vendor' OR 'dj'
```

### Permission Matrix

| Endpoint | user | admin | vendor | dj |
|---|---|---|---|---|
| GET /venues | ✅ | ✅ | ✅ | ✅ |
| POST /admin/venues | ❌ | ✅ | ❌ | ❌ |
| PUT /admin/venues/:id | ❌ | ✅ | ❌ | ❌ |
| PUT /vendor/venue | ❌ | ❌ | ✅ (own only) | ❌ |
| GET /vendor/venue/reviews | ❌ | ✅ | ✅ (own only) | ❌ |
| GET /djs | ✅ | ✅ | ✅ | ✅ |
| PUT /dj/profile | ❌ | ❌ | ❌ | ✅ (own only) |
| POST /dj/profile/events | ❌ | ❌ | ❌ | ✅ (own only) |
| PUT /admin/djs/:id | ❌ | ✅ | ❌ | ❌ |
| GET /admin/* | ❌ | ✅ | ❌ | ❌ |
| POST /posts | ✅ | ❌ | ❌ | ❌ |
| GET /feed | ✅ | ❌ | ❌ | ❌ |

### Ownership Validation

For vendor and DJ endpoints, always validate ownership from the JWT — never trust a URL param:

```ts
// Vendor: venue in JWT must match venue being accessed
@UseGuards(VendorGuard)
async getMyVenue(@Request() req) {
  const venueId = req.user.venueId  // from JWT — cannot be spoofed
  return this.venueService.findById(venueId)
}

// DJ: djProfileId in JWT must match profile being edited
@UseGuards(DJGuard)
async updateMyProfile(@Request() req, @Body() dto: UpdateDJDto) {
  const djProfileId = req.user.djProfileId  // from JWT — cannot be spoofed
  return this.djService.update(djProfileId, dto)
}
```

---

## 2. New Database Tables (auth-service: barblink_auth)

```sql
-- Vendor accounts (bar/club owners)
vendor_accounts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            VARCHAR(254) UNIQUE NOT NULL,
  password_hash    TEXT NOT NULL,
  business_name    VARCHAR(100) NOT NULL,
  contact_name     VARCHAR(100) NOT NULL,
  phone            VARCHAR(20) NOT NULL,
  business_type    VARCHAR(50) NOT NULL,
  business_address TEXT,
  instagram_url    TEXT,
  website_url      TEXT,
  admin_message    TEXT,
  venue_id         UUID,              -- linked after admin approval
  status           VARCHAR(20) DEFAULT 'pending',  -- pending|approved|rejected|suspended
  rejection_reason TEXT,
  approved_by      UUID,              -- admin_accounts.id
  approved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
)

-- DJ/Band accounts
dj_accounts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(254) UNIQUE NOT NULL,
  password_hash     TEXT NOT NULL,
  stage_name        VARCHAR(100) NOT NULL,
  dj_type           VARCHAR(20) NOT NULL,          -- dj | live_band
  genres            TEXT[],
  bio               TEXT,
  instagram_url     TEXT,
  phone             VARCHAR(20),
  dj_profile_id     UUID,            -- linked after admin approval
  claim_type        VARCHAR(10) NOT NULL,          -- new | claim
  claimed_profile_id UUID,           -- if claim: which auto-generated profile they want
  status            VARCHAR(20) DEFAULT 'pending', -- pending|approved|rejected|suspended
  rejection_reason  TEXT,
  approved_by       UUID,
  approved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
)

-- Admin accounts
admin_accounts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            VARCHAR(254) UNIQUE NOT NULL,
  password_hash    TEXT NOT NULL,
  name             VARCHAR(100) NOT NULL,
  totp_secret      TEXT,
  totp_enabled     BOOLEAN DEFAULT FALSE,
  last_login_at    TIMESTAMPTZ,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
)
```

---

## 3. auth-service — All Auth Endpoints

### User Auth (existing — do not break)

```
POST /auth/register         18+ DOB gate, phone OTP flow
POST /auth/send-otp         Send OTP to phone
POST /auth/verify-otp       Verify OTP, issue JWT (role: user)
POST /auth/login            Phone + password, issue JWT (role: user)
POST /auth/refresh          Rotate refresh token
POST /auth/logout           Delete refresh token
POST /auth/google           Google OAuth (role: user)
POST /auth/apple            Apple OAuth (role: user)
```

### Admin Auth (update existing)

```
POST /auth/admin/login
```
```ts
Body: { email: string, password: string }
Logic:
  1. Find admin_account by email, check is_active = true
  2. bcrypt compare password
  3. If totp_enabled:
     → return { requiresTOTP: true, tempToken } (tempToken = short JWT, 5min)
  4. If not:
     → issue full JWT { sub: admin.id, role: 'admin' }
  5. Update last_login_at
```

```
POST /auth/admin/totp-verify    Verify TOTP code, issue full JWT
POST /auth/admin/setup-totp     Generate TOTP secret + QR code URL
POST /auth/admin/confirm-totp   Save TOTP secret, enable 2FA
POST /auth/admin/change-password
```

### Vendor Auth (new)

```
POST /auth/vendor/register
```
```ts
Body: {
  email, password,
  businessName, contactName, phone,
  businessType,      // Bar | Club | Lounge | Live Music Venue | Restaurant Bar | Other
  businessAddress?,
  instagramUrl?,
  websiteUrl?,
  adminMessage?
}
Logic:
  1. Validate email unique, password min 8 chars + 1 number
  2. Hash password with bcrypt (12 rounds)
  3. Insert vendor_accounts (status: pending)
  4. Send confirmation email via Mailgun:
     Subject: "We received your Barblink vendor application"
     Body: "We'll review your application within 24 hours and notify you by email."
  5. Send admin alert email: "New vendor application: [businessName]"
Response: { message: "Application submitted. Check your email for confirmation." }
```

```
POST /auth/vendor/login
```
```ts
Body: { email, password }
Status checks (before issuing JWT):
  pending   → 403 "Your application is under review. We'll email you once approved."
  rejected  → 403 { error: "Application not approved.", reason: rejection_reason }
  suspended → 403 "Account suspended. Contact support@barblink.com"
  approved  → proceed to issue JWT
Logic:
  1. bcrypt compare
  2. Issue JWT: { sub: vendor.id, role: 'vendor', venueId: vendor.venue_id }
```

```
POST /auth/vendor/forgot-password
POST /auth/vendor/reset-password
POST /auth/vendor/change-password   (VendorGuard)
```

### DJ Auth (new)

```
POST /auth/dj/register
```
```ts
Body: {
  email, password,
  stageName,
  claimType,             // 'new' | 'claim'
  claimedProfileId?,     // required if claimType = 'claim'
  type,                  // 'dj' | 'live_band'
  genres: string[],
  bio?,
  instagramUrl?,
  phone?
}
Logic:
  1. If claimType = 'claim':
     - Verify claimedProfileId exists in dj_profiles table
     - Verify source = 'auto' (cannot claim already-claimed profile)
     - Verify no existing dj_account already linked to this profile
  2. Hash password
  3. Insert dj_accounts (status: pending)
  4. Send confirmation email
  5. Send admin alert: "New DJ application: [stageName] ([claimType])"
```

```
POST /auth/dj/login
```
```ts
Body: { email, password }
Status checks same as vendor
On approved: issue JWT { sub: dj.id, role: 'dj', djProfileId: dj.dj_profile_id }
```

```
POST /auth/dj/forgot-password
POST /auth/dj/reset-password
POST /auth/dj/change-password   (DJGuard)
```

### Admin: Manage Applications

```
GET  /admin/vendor-applications         Query: { status?, page, limit }
GET  /admin/vendor-applications/:id     Single application detail
POST /admin/vendor-applications/:id/approve
```
```ts
Body: { venueId?: string }
Logic:
  1. Set status = 'approved', approved_by, approved_at
  2. If venueId: set venue_id = venueId on vendor_account
  3. Send approval email: "Your application is approved. Login at venue.barblink.com"
```
```
POST /admin/vendor-applications/:id/reject
```
```ts
Body: { reason: string }
Logic:
  1. Set status = 'rejected', rejection_reason = reason
  2. Send rejection email with reason
```
```
POST /admin/vendor-applications/:id/suspend   Body: { reason }
POST /admin/dj-applications                   Query: { status?, page, limit }
GET  /admin/dj-applications/:id
POST /admin/dj-applications/:id/approve
```
```ts
Logic:
  1. Set status = 'approved'
  2a. claimType = 'claim': update dj_profiles set source = 'claimed', link dj_account.dj_profile_id
  2b. claimType = 'new': create new dj_profile from registration data, link to account
  3. Send approval email: "Your DJ profile is live. Login at dj.barblink.com"
```
```
POST /admin/dj-applications/:id/reject   Body: { reason }
POST /admin/dj-applications/:id/suspend  Body: { reason }
```

---

## 4. Venue Creation — Instagram URL Required

**Problem:** Currently admin can create a venue without an Instagram URL. The scraper needs Instagram to populate the profile. Instagram URL must be required.

### Updated venue creation flow

```
POST /admin/venues
```
```ts
Body: {
  instagramUrl: string     // REQUIRED — validated as valid Instagram URL
  crowdCapacity: number    // REQUIRED — used for crowd meter thresholds
  barClosesAt: string      // REQUIRED — e.g. "02:00"
  kitchenClosesAt?: string // optional
  area: string             // REQUIRED — dropdown selection
  country: string          // REQUIRED — MY | LK
}

Validation:
  1. instagramUrl must match: /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/
  2. Instagram handle extracted from URL (remove trailing slash, get last segment)
  3. crowdCapacity must be > 0
  4. area must be in approved list

Logic:
  1. Insert venue record (status: 'scraping') with instagram_url and instagram_handle
  2. Immediately trigger async scrape:
     POST http://scraper-service:3009/scrape/instagram/:venueId
     POST http://scraper-service:3009/scrape/google/:venueId
  3. Do NOT wait for scrape to complete — return immediately
  4. Admin sees venue in list with status 'scraping' → changes to 'active' on success

Response: {
  success: true,
  data: {
    venueId,
    message: "Venue created. Scraping Instagram and Google — profile will populate within 2 minutes.",
    instagramHandle: "@zouk.kl"
  }
}
```

### Venue status lifecycle

```
scraping   → active (scrape succeeded)
scraping   → scrape_failed (3 consecutive failures)
active     → inactive (admin deactivates)
```

Show status badge in admin venue list:
- `scraping` — amber spinner badge "Scraping..."
- `active` — green badge "Active"
- `scrape_failed` — red badge "Scrape Failed" + retry button
- `inactive` — grey badge "Inactive"

### What gets auto-populated from scrape

After scraper-service completes, it calls back to venue-service to update these fields:

**From Instagram:**
- `name` (from og:title or profile name)
- `description` / bio
- `cover_photo_url` (profile photo)
- `vibe_tags` (extracted from bio keywords)
- `genre_tags` (music genres detected in bio + captions)
- `venue_photos` (recent posts, up to 12)

**From Google:**
- `address` (formatted)
- `lat` / `lng` (GPS coordinates)
- `phone`
- `website_url`
- `price_range` (1–4 extracted from Google price level)
- `google_rating`
- `operating_hours` (per day of week)

**Admin must still manually enter:**
- `crowd_capacity` (entered on creation)
- `bar_closes_at` (entered on creation)
- `kitchen_closes_at` (entered on creation, optional)
- `category` (Bar / Club / Lounge / etc — may be auto-detected but admin confirms)

### Edit venue page — field ownership

| Field | Who can edit |
|---|---|
| Name | Admin only |
| Instagram URL | Admin only |
| Address, GPS | Admin only |
| Category | Admin only |
| Crowd capacity | Admin only |
| Country | Admin only |
| Area | Admin only |
| Description | Admin + Vendor (own venue) |
| Bar closing time | Admin + Vendor (own venue) |
| Kitchen closing time | Admin + Vendor (own venue) |
| Phone | Admin + Vendor (own venue) |
| Website URL | Admin + Vendor (own venue) |
| Cover photo | Admin + Vendor (own venue) |
| Status (active/inactive) | Admin only |

---

## 5. Vendor Portal (venue.barblink.com)

### App structure

```
apps/vendor-portal/
├── app/
│   ├── layout.tsx                   dark theme, Inter + Syne fonts
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx        multi-step form
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (portal)/                    requires VendorGuard
│   │   ├── layout.tsx               sidebar + topbar
│   │   ├── dashboard/page.tsx
│   │   ├── venue/page.tsx           view + edit own venue
│   │   ├── reviews/page.tsx
│   │   └── settings/page.tsx        change password
│   └── pending/page.tsx             shown to pending accounts
```

### Design — same brand as admin panel

```
Background: #0D0D0F
Sidebar: #111114
Surface: #141418
Accent: #C45AFF
Font: Inter (body) + Syne (headings)
```

### Pages

**Login page (/login)**
- Email + password form
- POST /auth/vendor/login
- Status-aware messaging:
  - pending → redirect to /pending page
  - rejected → show inline: "Your application was not approved: [reason]"
  - suspended → show inline: "Account suspended. Contact support@barblink.com"
- "Forgot password?" link
- "Register your venue →" link

**Register page (/register)**
Multi-step form with progress bar:

Step 1 — Account
- Email address
- Password (min 8 chars, 1 number, show strength indicator)
- Confirm password

Step 2 — Business details
- Business name *
- Contact name *
- Phone * (country picker, MY/LK default)
- Business type * (dropdown: Bar / Club / Lounge / Live Music Venue / Restaurant Bar / Other)
- Business address

Step 3 — Online presence
- Instagram URL (your business Instagram)
- Website URL (optional)

Step 4 — Note to admin
- Textarea: "Anything you'd like us to know?" (optional)
- Checkbox: agree to Terms of Service + Privacy Policy *
- Submit button

After submit: full-screen success state
- "✅ Application Submitted"
- "We'll review your application and email you at [email] within 24 hours."
- "Questions? Email us at hello@barblink.com"

**Pending page (/pending)**
Shown when vendor logs in but status = 'pending':
- "Your application is under review"
- Application details (business name, submitted date)
- Estimated review time: 24 hours
- Contact: hello@barblink.com

**Dashboard (/dashboard)**
- Venue name + category as header
- Stats row: Check-ins Today | This Week | Total Reviews | Avg Rating | Followers
- Tonight's lineup: DJ name + set times (from dj-service)
- Recent reviews: last 5 with star rating + body
- Quick actions: Edit Venue | View All Reviews

**Venue edit page (/venue)**
Two sections:

Editable by vendor:
- Description (textarea)
- Bar closing time (time picker)
- Kitchen closing time (time picker, optional)
- Phone number
- Website URL
- Cover photo (upload to MinIO)

Read-only (admin-managed, greyed out with tooltip: "Contact admin to change"):
- Venue name
- Instagram handle
- Address & GPS
- Category
- Area
- Country
- Crowd capacity

Save button → PUT /vendor/venue
Show success toast on save.

**Reviews page (/reviews)**
- Table: date | username | ⭐ overall | drinks | food | music | atmosphere | body
- Filter by: rating (1–5 stars), date range
- Sort by: newest / highest / lowest
- Average rating cards at top (overall + per category)
- Export CSV button → download
- No delete (admin-only)

**Settings page (/settings)**
- Change password form (current + new + confirm)
- Account info (read-only): email, business name, status badge, member since

---

## 6. DJ Portal (dj.barblink.com)

### App structure

```
apps/dj-portal/
├── app/
│   ├── layout.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx        2-path form (new or claim)
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (portal)/                    requires DJGuard
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── events/page.tsx
│   │   ├── ratings/page.tsx
│   │   ├── setlists/page.tsx
│   │   └── settings/page.tsx
│   └── pending/page.tsx
```

### Pages

**Login page (/login)**
- Email + password form
- POST /auth/dj/login
- Status-aware messaging (same as vendor)
- "Register or claim your profile →" link

**Register page (/register)**

Step 1 — Choose path (prominent visual choice):

```
┌─────────────────────────────┐  ┌─────────────────────────────┐
│  🎵 I'm new to Barblink     │  │  🔍 Claim my existing       │
│                             │  │     profile                 │
│  Create a fresh DJ or       │  │                             │
│  band profile               │  │  Barblink auto-generated    │
│                             │  │  a profile for me           │
│  [ Get started ]            │  │  [ Find my profile ]        │
└─────────────────────────────┘  └─────────────────────────────┘
```

Step 2a (new path):
- Stage name / band name *
- Type: DJ / Live Band (toggle)
- Genres (multi-select chips: EDM / House / Techno / Hip-Hop / R&B / Jazz / Live Band / Other)
- Bio (textarea, 300 chars max)
- Instagram URL (optional but recommended for auto-linking)

Step 2b (claim path):
- Search input: "Search your stage name..."
- As user types → GET /djs/search?q=... with debounce 300ms
- Show results as selectable cards:
  - DJ avatar (if found) + name + genre tags + "Plays at: [venues]" + "Last seen: [date]"
  - "Is this you?" tap to select
- After selecting: confirm screen showing full profile details
- "Instagram URL to verify your identity" field (must match or be plausible)

Step 3 — Account:
- Email *
- Password * (strength indicator)
- Confirm password *
- Phone (optional)

Submit → POST /auth/dj/register
Success screen same as vendor.

**Dashboard (/dashboard)**
- Profile header: avatar + stage name + genres + verified badge if claimed
- Stats row: Followers | Upcoming Gigs | Avg Rating | Total Events
- Upcoming gigs this week (venue + date + time)
- Recent ratings received (last 3)
- Quick links: Edit Profile | Manage Events

**Profile page (/profile)**

Editable by DJ:
- Bio (textarea)
- Genres (multi-select chips)
- Instagram URL
- Avatar (upload to MinIO)

Read-only:
- Stage name (greyed out: "Contact admin to change")
- Profile source badge: "Auto-generated" (amber) or "Verified" (green)

**Events page (/events)**
Tabs: Upcoming | Past

Upcoming events table:
| Venue | Event Name | Date | Start | End | RSVPs | Actions |
- Add Event button → modal:
  - Venue search (typeahead → GET /discovery/search?q=...)
  - Event name
  - Date picker
  - Start time / End time
  - POST /dj/profile/events
- Edit / Delete only upcoming events

Past events table (read-only):
| Venue | Event Name | Date | Avg Rating | Setlists |

**Ratings page (/ratings)**
- Summary cards: Avg Vibe ⭐ | Avg Music ⭐ | Avg Energy ⭐
- Recharts line chart: average rating per month (last 6 months)
- Table: event | venue | date | vibe | music | energy | comment (from user)

**Setlists page (/setlists)**
- Grouped by event (venue + date)
- Each setlist: songs list (numbered), notes, submitted by @username
- Read-only (cannot edit user-submitted setlists)
- "Post your own setlist" button for own events → PostSetlistModal

**Settings page (/settings)**
- Change password
- Account info (read-only)

---

## 7. Admin Panel Additions

### New sidebar sections

Add to existing sidebar:

```
─── REGISTRATIONS ───
🏛️  Vendor Applications    (red badge: pending count)
🎵  DJ Applications        (red badge: pending count)
```

### Vendor Applications page

**URL:** /vendor-applications

Header stats: Pending | Approved Today | Rejected This Week

Tabs: Pending (default) | Approved | Rejected | All

Table columns:
| Business Name | Contact | Email | Phone | Type | Instagram | Submitted | Status | Actions |

Row actions: "Review" button → opens right slide-over panel:

**Review panel content:**
- All application fields displayed in clean layout
- Instagram link → opens in new tab (admin manually verifies account is real)
- Website link (if provided)
- Admin notes textarea (internal note, not shown to vendor)

**Approve flow:**
- "Link to existing venue" dropdown (searchable, searches all venues)
- OR "Create new venue from this registration" checkbox (auto-creates venue with their Instagram URL → triggers scrape)
- Approve button → POST /admin/vendor-applications/:id/approve
- Auto-sends approval email

**Reject flow:**
- Reason textarea * (required)
- Reject button → POST /admin/vendor-applications/:id/reject
- Auto-sends rejection email with reason

### DJ Applications page

**URL:** /dj-applications

Table columns:
| Stage Name | Type | Claim | Genres | Instagram | Email | Submitted | Status | Actions |

Review panel (claim type = 'claim'):
- Left: Application details
- Right: Matched auto-generated profile from DB
- Side-by-side comparison (name, genres, Instagram, venues played)
- Approve → links account to profile, sets source = 'claimed'
- Reject → reason + email

Review panel (claim type = 'new'):
- Full new profile details preview
- Approve → creates new dj_profile, links to account
- Reject → reason + email

---

## 8. Nginx — Add New Portals

Add to `infrastructure/nginx/nginx.conf`:

```nginx
# Vendor portal
server {
  listen 80;
  server_name venue.barblink.com;
  location / {
    proxy_pass http://vendor-portal:3020;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}

# DJ portal
server {
  listen 80;
  server_name dj.barblink.com;
  location / {
    proxy_pass http://dj-portal:3021;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}

# Add to api.barblink.com server block:
location /v1/auth/vendor/    { proxy_pass http://auth-service:3001; }
location /v1/auth/dj/        { proxy_pass http://auth-service:3001; }
location /v1/vendor/         { proxy_pass http://venue-service:3003; }
location /v1/dj/             { proxy_pass http://dj-service:3010; }
location /v1/admin/vendor-applications/ { proxy_pass http://auth-service:3001; }
location /v1/admin/dj-applications/     { proxy_pass http://auth-service:3001; }
```

---

## 9. Docker Compose Additions

```yaml
  vendor-portal:
    build: ../../apps/vendor-portal
    environment:
      NEXT_PUBLIC_API_URL: https://api.barblink.com/v1
      NODE_ENV: ${NODE_ENV}
    ports: ["3020:3020"]

  dj-portal:
    build: ../../apps/dj-portal
    environment:
      NEXT_PUBLIC_API_URL: https://api.barblink.com/v1
      NODE_ENV: ${NODE_ENV}
    ports: ["3021:3021"]
```

---

## 10. Email Templates (notification-service)

Add these Mailgun templates:

| Template key | Subject | Recipient | Trigger |
|---|---|---|---|
| `vendor-applied` | "We received your Barblink venue application" | Vendor | On register |
| `vendor-applied-admin` | "New venue application: [businessName]" | Admin | On register |
| `vendor-approved` | "Your Barblink vendor account is approved ✅" | Vendor | On admin approve |
| `vendor-rejected` | "Update on your Barblink application" | Vendor | On admin reject |
| `vendor-password-reset` | "Reset your Barblink vendor password" | Vendor | On forgot password |
| `dj-applied` | "We received your Barblink DJ application" | DJ | On register |
| `dj-applied-admin` | "New DJ application: [stageName]" | Admin | On register |
| `dj-approved` | "Your Barblink DJ profile is live ✅" | DJ | On admin approve |
| `dj-rejected` | "Update on your Barblink DJ application" | DJ | On admin reject |
| `dj-password-reset` | "Reset your Barblink DJ portal password" | DJ | On forgot password |

All emails: dark theme HTML, Barblink branding, owl mascot.

---

## 11. Build Order

Follow this sequence — each step must be working before the next:

1. **Database migrations** — add vendor_accounts, dj_accounts, admin_accounts tables to barblink_auth DB
2. **auth-service** — add all vendor + DJ + admin auth endpoints, update JWT to include role + venueId + djProfileId
3. **RBAC guards** — build all guards in shared-utils, apply to all existing endpoints
4. **Venue creation validation** — make instagramUrl required on POST /admin/venues, update admin panel add venue form
5. **Venue edit field ownership** — vendor can only edit allowed fields via PUT /vendor/venue
6. **Admin panel: Vendor Applications page**
7. **Admin panel: DJ Applications page**
8. **Vendor portal app** — login → register → pending → dashboard → venue → reviews → settings
9. **DJ portal app** — login → register (new + claim paths) → pending → dashboard → profile → events → ratings → setlists → settings
10. **Nginx** — add venue.barblink.com and dj.barblink.com routing
11. **Email templates** — all 10 templates wired to triggers
12. **End-to-end test** — full vendor registration → admin approval → vendor login → venue edit flow
13. **End-to-end test** — full DJ claim flow → admin approval → DJ login → profile edit → add event

---

## 12. Testing Checklist

**RBAC:**
- [ ] User JWT cannot access /admin/* endpoints (401)
- [ ] Vendor JWT cannot access /admin/* endpoints (401)
- [ ] Vendor JWT can access /vendor/venue (200)
- [ ] Vendor JWT cannot access another vendor's venue (403)
- [ ] DJ JWT can access /dj/profile (200)
- [ ] DJ JWT cannot edit another DJ's profile (403)
- [ ] Admin JWT can access all /admin/* endpoints (200)

**Venue creation:**
- [ ] POST /admin/venues without instagramUrl → 400 validation error
- [ ] POST /admin/venues with invalid Instagram URL format → 400
- [ ] POST /admin/venues with valid Instagram URL → 201, status = 'scraping'
- [ ] After scrape: venue status = 'active', name + photos populated
- [ ] After 3 scrape failures: status = 'scrape_failed', admin alert sent

**Vendor portal:**
- [ ] Register → confirmation email received
- [ ] Login before approval → see pending page
- [ ] Admin approves → approval email received
- [ ] Login after approval → reach dashboard
- [ ] Edit description → saved correctly
- [ ] Try to edit venue name → field is greyed out / disabled
- [ ] Admin rejects → rejection email with reason received

**DJ portal:**
- [ ] New registration → pending, confirmation email
- [ ] Claim registration → search finds auto-generated profile, submit works
- [ ] Admin sees claim comparison (application vs existing profile)
- [ ] Admin approves claim → profile source = 'claimed', DJ can login
- [ ] DJ can edit bio/genres but not stage name
- [ ] DJ adds event → appears in their events list + notifies followers
