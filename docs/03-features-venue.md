# 03 — Venue Features

## Overview

Venue profiles are created and managed entirely by the Barblink admin — venues do not self-onboard in Phase 1. Profile data is auto-populated by scraping the venue's Instagram and Google, with admin filling in any gaps manually.

---

## Venue Profile Fields

| Field | Source |
|---|---|
| Name | Admin input |
| Category / type | Scraped from Instagram bio + Google |
| Description / vibe | Scraped from Instagram bio |
| Address | Scraped from Google Maps |
| GPS coordinates | Scraped from Google Maps |
| Operating hours | Scraped from Google Maps |
| Kitchen closing time | Admin input (if applicable) |
| Bar closing time | Admin input |
| Price range | Scraped from Google |
| Music genres / vibe tags | Scraped from Instagram bio/captions |
| Profile photos | Scraped from Instagram |
| Recent posts gallery | Scraped from Instagram (auto-synced) |
| Google rating | Scraped from Google |
| Google reviews | Scraped from Google |
| Tonight's DJ | Scraped from Instagram posts |
| Upcoming events | Scraped from Instagram posts |
| Crowd capacity (max) | Admin input |
| Instagram handle | Admin input (used for scraping) |

---

## Instagram Scraping

### Tool
**Playwright** (open source, Microsoft) — headless browser approach.
- Better anti-detection than Puppeteer
- Stealth mode via playwright-extra stealth plugin
- Future upgrade path to Apify (paid) when scale demands it

### What Gets Scraped from Instagram

| Data | Frequency |
|---|---|
| Profile photo | One-time on creation |
| Bio (description, vibe, genres) | One-time on creation (bio rarely changes) |
| Recent posts (photos + captions) | Every 12 hours + on-demand when user visits venue page |
| Event details from captions (DJ name, date, time, event name) | Every 12 hours |
| Story highlights | One-time on creation |

### Sync Trigger
- **Scheduled:** Every 12 hours automatic background job
- **On-demand:** Triggered when a user opens that venue's page in the app (if last sync > 2 hours ago)

### Block & Failure Handling

| Scenario | Action |
|---|---|
| Scrape fails (first time) | Serve cached last-scraped data, retry after 2 hours |
| 3 consecutive failures | Escalated alert sent to admin panel |
| Admin alert | Shows which venue failed, last successful sync time, manual retry button |
| Future fallback | Apify paid service (Phase 2) |

---

## Google Scraping

### Tool
**Playwright** — direct scrape of Google Maps and Google Search.

### What Gets Scraped from Google

| Data | Frequency |
|---|---|
| Address (formatted) | One-time on creation |
| GPS coordinates (lat/lng) | One-time on creation |
| Operating hours | One-time on creation |
| Price range | One-time on creation |
| Overall Google rating | One-time on creation |
| Google reviews (top 10) | One-time on creation |
| Phone number | One-time on creation |
| Website URL | One-time on creation |

### Re-sync
- Google data is scraped once at venue creation
- Admin can manually trigger a re-scrape from the admin panel if details have changed

---

## Venue Page (User-Facing)

- Hero photo / recent Instagram photo
- Venue name, category tags, address
- Two closing times: Kitchen closes at [time] / Bar closes at [time]
- **Live crowd meter** — based on real-time check-in count
- "X friends here now" with friend avatars
- Ratings:
  - Overall star rating
  - Drinks quality
  - Food quality
  - Music / DJ
  - Atmosphere
  - Sound system
  - Service
- Written reviews (from Barblink users + imported Google reviews)
- Emoji reactions: 🔥 😐 👎
- **Tonight's DJ** — name, genre, set times
- **Upcoming events** list
- Recent Instagram posts (photo gallery)
- Venue photo wall — all user posts tagged at this venue
- Follow venue button
- Check In button
- "Who's Joining Me?" button (share to your feed)

---

## Crowd Meter

- Based on number of active check-ins at the venue
- Check-in = user taps "I'm Here" on a venue page (one tap, no QR, no scanning)
- Active check-in = checked in within the last 3 hours (auto-expires)
- User can manually tap "Leave" to check out early
- Thresholds:
  - 🟢 Green = Quiet (0–30% of capacity)
  - 🟡 Amber = Getting Lively (31–70% of capacity)
  - 🔴 Red = Packed (71–100% of capacity)
- Crowd meter updates in real-time via Socket.io
- Visible on: venue page, map pins, list view cards, friends' feed check-in cards
- Crowd capacity (max) set by admin per venue

---

## Venue Discovery

### Map View
- OpenStreetMap + react-native-maps
- Real-time crowd indicator on map pins (green / amber / red)
- Friend avatars on map showing who is checked in where
- Change location — search any area in Malaysia

### List View
- Sorted by distance (default), crowd, rating, or friends here
- Each venue card shows:
  - Name, category tag, distance
  - Crowd meter indicator
  - Closing time
  - Friend count currently checked in
  - Star rating

### Filters
- Music / vibe category
- Open now / closing soon
- Friends here
- Distance radius
- Price range
- Has DJ tonight
- Has live band tonight

---

## Venue Announcements (Phase 2)

- Venues can pin an announcement to their followers' feeds
- Example: "Free flow until 10pm tonight — come early!"
- Appears as a distinct card type in the feed

---

## DJ Auto-Profile Creation (Venue-Linked)

When the Instagram scraper detects a DJ or band name in a venue's posts or captions:

1. Search existing DJ profiles for a name match
2. If not found → auto-create a new DJ/band profile
3. Link the DJ profile to the venue and the specific event date
4. Attempt to find the DJ's own Instagram from mentions or tags
5. If found → scrape DJ's profile photo and bio
6. Mark profile as "auto-generated" (upgradeable to claimed in Phase 2)

---

## Venue Photo Wall

- A gallery tab on the venue page
- Aggregates all user posts that tagged this venue
- Sorted by most recent
- Tapping a photo opens the original post
