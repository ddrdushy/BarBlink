# Claude Code Instructions — Admin Panel (apps/admin)

## Overview

The Barblink admin panel is a Next.js 14 web app at `admin.barblink.com`. It is the full control centre for managing the platform. The current build has a basic dashboard, venues, users, posts, and check-ins. This doc specifies everything that needs to be built or expanded.

Read `docs/04-features-admin.md`, `docs/05-tech-stack.md`, `docs/06-database-schema.md`, and `docs/07-api-structure.md` before writing any code.

---

## Stack

- Next.js 14 App Router
- TypeScript strict mode
- Tailwind CSS
- Shadcn/ui components (for tables, dialogs, badges, dropdowns)
- Recharts (for charts and graphs)
- React Query (TanStack Query) for data fetching and cache
- next-auth for admin session management

---

## Design System

```
Background:       #0D0D0F
Sidebar bg:       #111114
Surface:          #141418
Surface raised:   #1A1A1F
Border:           rgba(255,255,255,0.07)
Purple accent:    #C45AFF
Purple dim:       rgba(196,90,255,0.12)
White:            #FFFFFF
Muted:            #888899
Green:            #32D74B
Amber:            #FFD60A
Red:              #FF453A
Font:             Inter (body), Syne (headings, logo)
```

All pages use dark theme only. No light mode.

---

## Sidebar Navigation (full spec)

The sidebar should contain ALL of the following nav items — not just the current 5:

```
🦉 BARBLINK  (logo, top)
   ADMIN

─── OVERVIEW ───
📊  Dashboard
📈  Analytics (DAU chart, growth)

─── CONTENT ───
🏛️  Venues
🎵  DJ & Bands
📅  Events
📸  Posts
✅  Check-ins

─── COMMUNITY ───
👥  Users
🚩  Reports          ← badge showing unread count
🏆  Leaderboard

─── PLATFORM ───
🔄  Scraper Status   ← badge showing failure count
📧  Waitlist
⚙️  Settings

─── ACCOUNT ───
🚪  Log out
```

Active state: purple background pill, white text.
Inactive state: muted text, transparent bg, purple icon on hover.
Report badge and Scraper badge: red dot with count — always visible when count > 0.

---

## Page Specifications

---

### 1. Dashboard (expand current)

**Current state:** Basic metric cards + DAU bar + active now + total posts.

**Add the following:**

#### Metric Cards Row (top)
Keep existing 4 cards (Total Users, Total Venues, Check-ins Today, Posts Today) but add:
- **New Users Today** (green accent)
- **Active DJs** (purple accent)

Each card: dark surface, subtle border, icon top-right, metric number large (Syne font), label above, colour-coded bottom border.

#### DAU Progress Bar (keep, improve)
- Show current DAU vs 1,000 target
- Progress bar in neon purple
- Below bar: "X more users to unlock Phase 2 (venue commerce)"
- When DAU hits 1,000: bar turns green, message changes to "Phase 2 unlocked! 🎉"

#### DAU Chart (NEW — add below metric cards)
- Line chart (Recharts LineChart)
- X axis: last 30 days (dates)
- Y axis: DAU count
- Purple line, dark grid lines, tooltip on hover
- Title: "Daily Active Users — Last 30 Days"
- Data from: `GET /admin/analytics/dau`

#### Activity Feed (NEW — right sidebar panel)
- Real-time list of recent platform events:
  - New user registered
  - Venue scraped successfully
  - Scraper failed (venue name, red)
  - New report submitted (orange)
  - DJ profile auto-created
- Shows last 20 events, newest at top
- Each item: timestamp + icon + description
- Refreshes every 30 seconds

#### Quick Actions (NEW — below DAU chart)
- "Add New Venue" → opens Add Venue modal
- "View Reports Queue" → navigates to Reports page
- "Export Waitlist" → downloads CSV
- "Check Scraper Health" → navigates to Scraper Status page

---

### 2. Venues (expand significantly)

**Current state:** Basic venue list table.

#### Venue List Page

Table columns:
| Column | Details |
|---|---|
| Name | Venue name + category tag pill |
| Area | KL neighbourhood |
| Instagram | Handle as clickable link |
| Last IG Sync | Timestamp + status dot (green=ok, red=failed) |
| Last Google Sync | Timestamp |
| Check-ins Today | Number |
| Status | Active / Inactive pill badge |
| Actions | Edit / Sync / Deactivate buttons |

- Search bar (filter by name, area)
- Filter dropdown: All / Active / Inactive / Sync Failed
- "Add Venue" button (top right, purple)
- Pagination (20 per page)
- Click row → opens venue detail page

#### Add Venue Modal / Page

Fields:
```
Instagram URL *        (text input — required, triggers scrape on submit)
Crowd Capacity *       (number input — required, used for crowd meter)
Bar Closing Time *     (time picker)
Kitchen Closing Time   (time picker, optional)
Area *                 (dropdown: Bukit Bintang / KLCC / Bangsar / Mont Kiara / Sri Hartamas / Desa ParkCity / Other)
```

On submit:
1. POST to `/admin/venues` with the above fields
2. Show loading state: "Scraping Instagram..." → "Scraping Google..." → "Done"
3. Show what was auto-populated (name, photos count, bio, events found, DJ names found)
4. On success: redirect to venue detail page
5. On scrape failure: show error, allow manual data entry fallback

#### Venue Detail / Edit Page

Sections:

**A. Basic Info (editable)**
- Name, description, category, vibe tags, genre tags
- Instagram handle, website URL, phone
- Address, GPS coordinates (lat/lng)
- Area (dropdown)
- Bar closing time, kitchen closing time
- Price range (1–4 stars)
- Crowd capacity
- Status toggle (Active / Inactive)

**B. Scraped Photos**
- Grid of all scraped Instagram photos
- Admin can: mark as cover photo, delete, reorder
- "Upload Custom Photo" button (override scraped)

**C. Scraper Status**
- Instagram: last sync time, status, items synced
- Google: last sync time, status
- "Re-scrape Instagram" button → triggers immediate scrape
- "Re-scrape Google" button → triggers immediate Google scrape
- Sync history table (last 10 syncs: timestamp, status, items, error if any)

**D. Tonight's DJ Lineup**
- List of DJ/band events linked to this venue for today
- Each row: DJ name (link to DJ profile), event name, set time
- "Add Event Manually" button

**E. Reviews**
- List of all Barblink user reviews for this venue
- Each row: username, rating, body, date, emoji reaction
- Admin can delete a review

**F. Check-in History**
- Chart: check-ins per day for last 30 days (Recharts BarChart)
- Total all-time check-ins

---

### 3. DJ & Bands (NEW page — does not exist yet)

#### DJ / Band List Page

Table columns:
| Column | Details |
|---|---|
| Name | DJ/band name |
| Type | DJ / Live Band pill |
| Genre Tags | Pill badges |
| Source | Auto-generated / Claimed |
| Linked Venues | Count of venues they've played |
| Upcoming Gigs | Count |
| Followers | Count |
| Status | Active / Inactive |
| Actions | Edit / Merge / Deactivate |

- Search bar (by name, genre)
- Filter: All / DJs only / Bands only / Auto-generated / Claimed / Inactive
- "Add Manually" button

#### DJ / Band Detail / Edit Page

**A. Profile Info (editable)**
- Name
- Type (DJ / Live Band) — dropdown
- Genre tags (multi-select tag input)
- Bio
- Instagram URL
- Avatar photo (upload or scraped)
- Source (auto/claimed — read-only)
- Status toggle

**B. Upcoming Events**
- Table: Event name, Venue, Date, Start time, End time
- "Add Event" button → modal with: venue (searchable dropdown), event name, date, start/end time
- Delete event button per row

**C. Past Events**
- Last 20 past events (venue, date)

**D. Ratings Summary**
- Average vibe rating, music rating, energy rating
- Number of ratings received

**E. Setlists**
- List of user-submitted setlists for this DJ
- Admin can delete inappropriate ones

**F. Merge Duplicate Profiles**
- Search for another DJ profile to merge into this one
- Preview what will be merged (events, followers, ratings all carry over)
- Confirm merge → deletes duplicate, keeps this profile

---

### 4. Events (NEW page — does not exist yet)

#### Events List Page

Table columns:
| Column | Details |
|---|---|
| Title | Event name |
| Venue | Venue name (link) |
| DJ / Band | Name (link to DJ profile), blank if none |
| Date | Date + doors open time |
| RSVPs | Count |
| Source | Instagram scrape / Admin |
| Status | Active / Inactive |
| Actions | Edit / Deactivate |

- Filter: Tonight / This Week / All Upcoming / Past
- "Add Event" button

#### Add / Edit Event

Fields:
```
Title *
Venue *          (searchable dropdown of all venues)
DJ / Band        (searchable dropdown of all DJ profiles, optional)
Event Date *
Doors Open       (time)
Ends At          (time)
Description      (textarea)
Cover Image URL  (text, optional)
Ticket URL       (text, optional — Phase 2)
Status           (Active / Inactive toggle)
```

---

### 5. Posts (expand current)

**Current state:** Basic posts table.

**Expand to:**

Table columns:
| Column | Details |
|---|---|
| User | Avatar + username |
| Type | Photo / Video / Drink Rating / Poll / Repost / Night Recap |
| Caption preview | First 60 chars |
| Venue Tag | Venue name if tagged |
| Likes | Count |
| Comments | Count |
| Reports | Count (red badge if > 0) |
| Created | Timestamp |
| Status | Active / Removed |
| Actions | View / Remove |

- Filter: All / Reported / Removed / By type
- Sort: Newest / Most reported / Most liked
- Click "View" → opens post detail modal showing full post with media
- Click "Remove" → confirm dialog → soft-delete the post
- Posts with report count > 0 highlighted with red left border

---

### 6. Check-ins (expand current)

**Current state:** Basic check-ins list.

**Expand to:**

Table columns:
| Column | Details |
|---|---|
| User | Avatar + username |
| Venue | Venue name |
| Checked In At | Timestamp |
| Duration | Auto or manual checkout time |
| Group | Yes/No |
| Status | Active / Expired / Checked Out |

- Filter: Active now / Today / This week
- "Active Now" counter prominently at top (large number, green)
- Map view toggle: show all active check-ins on a map (OpenStreetMap embed via iframe or react-leaflet)

---

### 7. Users (expand current)

**Current state:** Basic user list.

**Expand to:**

#### User List Page

Table columns:
| Column | Details |
|---|---|
| User | Avatar + username + display name |
| Phone | Masked: +60 1X XXX XXXX |
| Registered | Date |
| Last Active | Relative time |
| Posts | Count |
| Check-ins | Count |
| Reports Against | Count (red if > 0) |
| Status | Active / Suspended / Banned |
| Actions | View / Suspend / Ban |

- Search: by username, display name, phone
- Filter: All / Active / Suspended / Banned / Has Reports

#### User Detail Page

Sections:

**A. Profile Summary**
- Avatar, username, display name, bio
- Phone number, registration date, last active
- Current status (Active / Suspended / Banned) + badge
- Going tonight status
- Total posts, total check-ins, total followers, total following

**B. Actions (admin)**
- Suspend user (with reason + duration: 1 day / 3 days / 7 days / 30 days)
- Ban user permanently (with reason)
- Unsuspend / Unban
- Force logout (invalidate all refresh tokens)
- Reset profile photo (if inappropriate)

**C. Report History**
- List of all reports submitted against this user
- Each: report type, reporting user, date, status (actioned/pending)

**D. Post History**
- Last 20 posts: thumbnail/type, caption, date, status

**E. Check-in History**
- Last 20 check-ins: venue, date, duration

**F. Suspension Log**
- All past suspensions/bans: reason, duration, admin who actioned, date

---

### 8. Reports (NEW page — does not exist yet)

This is the content moderation queue. Critical for any social media platform.

#### Reports Queue Page

**Header stats:**
- Pending reports count (large number, red if > 0)
- Actioned today count
- Average response time

**Filters (tabs):**
- All | Pending | Actioned | Posts | Users | Comments

**Table columns:**
| Column | Details |
|---|---|
| Type | Post / Comment / User |
| Content Preview | First line of post caption or comment body |
| Reported By | Username |
| Reason | Inappropriate / Underage / Spam / Harassment / Fake venue tag |
| Date Reported | Timestamp |
| Status | Pending / Approved (kept) / Removed / User Warned / User Suspended |
| Actions | Review |

- Clicking "Review" opens a side panel or modal showing:
  - Full content (photo if post, full comment text, full user profile if user report)
  - Report reason and any additional notes from reporter
  - Action buttons:
    - **Approve** (content is fine, keep it, dismiss report)
    - **Remove Content** (delete the post/comment)
    - **Warn User** (send a warning notification to the user)
    - **Suspend User** (1 day / 3 days / 7 days)
    - **Ban User** (permanent)
  - After any action: report marked as actioned, move to next report automatically

- Keyboard shortcuts for fast moderation: A = Approve, R = Remove, W = Warn, S = Suspend

---

### 9. Analytics (NEW page — does not exist yet)

#### Analytics Page

**Section A — User Growth**
- Line chart: Total registered users over time (last 90 days)
- Line chart: DAU over last 30 days
- Bar chart: New registrations per day (last 30 days)

**Section B — Engagement**
- Bar chart: Posts created per day (last 30 days)
- Bar chart: Check-ins per day (last 30 days)
- Metric: Average posts per active user
- Metric: Average check-ins per active user

**Section C — Top Venues**
- Table: Top 10 venues by check-ins today
- Table: Top 10 venues by check-ins this week
- Table: Top 10 venues by followers

**Section D — Top DJs**
- Table: Top 10 DJs by followers
- Table: Top 10 DJs by gigs this month

**Section E — Neighbourhood Activity**
- Bar chart: Check-ins per neighbourhood this week
- Neighbourhoods: Bukit Bintang, KLCC, Bangsar, Mont Kiara, Sri Hartamas, Desa ParkCity, Other

All charts use Recharts. Dark theme grid lines (rgba(255,255,255,0.06)), purple or green lines/bars.

---

### 10. Scraper Status (NEW page — does not exist yet)

This is the health dashboard for the Instagram + Google scraper service.

#### Scraper Status Page

**Header summary cards:**
- Total venues being tracked
- Venues synced successfully (last 24hrs)
- Venues with failures
- Scraper queue length (jobs waiting)

**Per-venue Scraper Table:**

Table columns:
| Column | Details |
|---|---|
| Venue | Name + area |
| Instagram Handle | Clickable |
| Last IG Sync | Timestamp + status (✅ / ❌ / ⚠️) |
| IG Failure Count | Number (red if ≥ 3) |
| Last Google Sync | Timestamp + status |
| Items Synced | Photos count + events count |
| Error | Last error message if failed |
| Actions | Re-scrape IG / Re-scrape Google |

- Filter: All / Healthy / Failed / Not Synced in 24hrs
- Red row highlight for venues with 3+ consecutive failures
- "Re-scrape All Failed" bulk action button (top right)
- Clicking "Re-scrape IG" → triggers immediate Instagram scrape for that venue, shows spinner

**Scraper Log (below table):**
- Live log of last 50 scraper events
- Each entry: timestamp, venue name, source (IG/Google), status, items synced, error
- Color coded: green for success, red for failure, amber for partial
- Auto-refreshes every 15 seconds

---

### 11. Waitlist (NEW page — does not exist yet)

#### Waitlist Page

**Header stats:**
- Total emails collected
- Emails added today
- Emails added this week

**Waitlist Table:**

Table columns:
| Column | Details |
|---|---|
| Email | Email address |
| Source | landing_page (only source for now) |
| Date Added | Timestamp |

- Search by email
- Sort: Newest first (default)
- Pagination (50 per page)

**Actions (top right):**
- "Export CSV" button → downloads full waitlist as CSV
- "Send Launch Email" button → confirm dialog → sends Mailgun email blast to all emails on list
  - Confirm dialog shows: "You are about to send to X emails. This cannot be undone."
  - Email subject and body preview shown in confirm dialog
  - Only enabled when app is ready to launch (can be toggled in Settings)

---

### 12. Leaderboard (NEW page — does not exist yet)

#### Leaderboard Page

**Tabs:** This Week | Last Week | All Time

**Filters:** KL-wide | By Neighbourhood (dropdown)

**Table:**

| Rank | User | Check-ins | Posts | Score | Area |
|---|---|---|---|---|---|
| 🥇 1 | @username | 12 | 8 | 480 | Bukit Bintang |
| 🥈 2 | ... | ... | ... | ... | ... |

- Top 3 get gold/silver/bronze highlight
- Admin can manually disqualify a user from leaderboard (for gaming the system)
- Shows all-time top 100

---

### 13. Settings (NEW page)

Simple settings page for platform-level toggles:

**Platform Settings:**
- App launch mode: Waitlist only / App available (toggle — controls whether launch email button is enabled)
- DAU Phase 2 target (editable number, default 1000)
- Scraper sync interval (dropdown: 6hrs / 12hrs / 24hrs)
- Auto-moderation: keyword filter (textarea — one keyword per line)

**Admin Account:**
- Change admin password
- Enable / disable 2FA (TOTP)

---

## File Structure

```
apps/admin/
├── app/
│   ├── layout.tsx                    ← root layout, dark theme, Inter + Syne fonts
│   ├── (auth)/
│   │   └── login/page.tsx            ← admin login page
│   ├── (dashboard)/
│   │   ├── layout.tsx                ← sidebar + topbar layout
│   │   ├── page.tsx                  ← Dashboard
│   │   ├── analytics/page.tsx
│   │   ├── venues/
│   │   │   ├── page.tsx              ← Venue list
│   │   │   ├── add/page.tsx          ← Add venue
│   │   │   └── [id]/page.tsx         ← Venue detail/edit
│   │   ├── djs/
│   │   │   ├── page.tsx              ← DJ/Band list
│   │   │   └── [id]/page.tsx         ← DJ detail/edit
│   │   ├── events/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── posts/page.tsx
│   │   ├── checkins/page.tsx
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── scraper/page.tsx
│   │   ├── waitlist/page.tsx
│   │   ├── leaderboard/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       └── [...all admin API proxy routes]
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── PageHeader.tsx
│   ├── shared/
│   │   ├── MetricCard.tsx
│   │   ├── DataTable.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── LoadingSpinner.tsx
│   ├── dashboard/
│   │   ├── DAUChart.tsx
│   │   ├── ActivityFeed.tsx
│   │   └── QuickActions.tsx
│   ├── venues/
│   │   ├── VenueTable.tsx
│   │   ├── AddVenueForm.tsx
│   │   ├── ScraperStatusCard.tsx
│   │   └── VenuePhotoGrid.tsx
│   ├── djs/
│   │   ├── DJTable.tsx
│   │   ├── MergeProfileModal.tsx
│   │   └── EventsTable.tsx
│   ├── reports/
│   │   ├── ReportsQueue.tsx
│   │   └── ReviewPanel.tsx
│   ├── scraper/
│   │   ├── ScraperTable.tsx
│   │   └── ScraperLog.tsx
│   └── waitlist/
│       ├── WaitlistTable.tsx
│       └── SendLaunchEmailModal.tsx
├── lib/
│   ├── api.ts                        ← axios instance pointing to backend API
│   ├── auth.ts                       ← next-auth config
│   └── utils.ts                      ← formatters, helpers
└── types/
    └── index.ts                      ← admin-specific TypeScript types
```

---

## API Connections

All admin API calls go to `https://api.barblink.com/v1/admin/*`.
Use a shared axios instance in `lib/api.ts` with the admin JWT token attached.

Key endpoints referenced in `docs/07-api-structure.md`:
```
GET    /admin/dashboard              ← Dashboard stats
GET    /admin/analytics/dau          ← DAU chart data
GET    /admin/venues                 ← Venue list
POST   /admin/venues                 ← Add venue (triggers scrape)
PUT    /admin/venues/:id             ← Edit venue
POST   /admin/venues/:id/scrape/instagram
POST   /admin/venues/:id/scrape/google
GET    /admin/venues/scraper-status  ← All scraper health
GET    /admin/users                  ← User list
GET    /admin/users/:id              ← User detail
POST   /admin/users/:id/suspend
POST   /admin/users/:id/ban
GET    /admin/reports                ← Reports queue
PUT    /admin/reports/:id            ← Action on a report
GET    /admin/waitlist               ← Waitlist list
POST   /admin/waitlist/export        ← Export CSV
POST   /admin/waitlist/announce      ← Send launch email
GET    /admin/djs                    ← DJ list
PUT    /admin/djs/:id                ← Edit DJ
POST   /admin/djs/merge              ← Merge duplicates
```

---

## Priority Build Order

Build in this sequence — each must work before the next:

1. Sidebar navigation (all items, badges, active state)
2. Dashboard (expand with DAU chart + activity feed + quick actions)
3. Venues (full add + edit + scraper status per venue)
4. Scraper Status page (standalone health dashboard)
5. DJ & Bands (list + edit + merge)
6. Events (list + add/edit)
7. Reports queue (this is critical — build fully with review panel)
8. Users (expand with detail page + suspend/ban actions)
9. Waitlist (table + export + launch email)
10. Analytics (charts)
11. Leaderboard
12. Settings

---

## Important Notes

- Every destructive action (ban, remove content, send email blast) requires a confirm dialog
- All tables must be server-side paginated — do not load all records client-side
- Reports queue must refresh automatically every 60 seconds
- Scraper status log must refresh every 15 seconds
- The sidebar report badge and scraper failure badge must poll for updates every 60 seconds
- Mobile responsive is NOT required for the admin panel — desktop only (min-width: 1024px)
- All timestamps should be displayed in GMT+8 (Malaysia timezone)
- Use `date-fns` for all date formatting
