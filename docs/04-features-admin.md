# 04 — Admin Panel Features

## Overview

The admin panel is a web application (Next.js) accessible only to Barblink platform administrators. It is the control centre for managing all venues, users, content, and platform health. Venue owners do not have access — all venue management is done by admin in Phase 1.

**Access:** admin.barblink.com (internal, protected by 2FA)

---

## Venue Management

### Add a New Venue
1. Admin inputs the venue's Instagram profile URL
2. System triggers Playwright scraper immediately
3. Scraper pulls: profile photo, bio, recent posts, events, DJ names
4. System also triggers Google scraper: address, GPS, hours, price range, rating, reviews
5. Data auto-populates the venue profile — no review step, goes live automatically
6. Admin can manually edit any field after creation

### Venue List
- Table of all venues on the platform
- Columns: name, area, category, last Instagram sync time, last Google sync time, status (active / inactive), total check-ins
- Search and filter by area, category, status
- Bulk actions: activate, deactivate, force re-sync

### Edit a Venue
- Edit any field manually (name, hours, capacity, closing times, etc.)
- Manually trigger Instagram re-scrape
- Manually trigger Google re-scrape
- Upload custom photos (override scraped ones)
- Set crowd capacity (used for crowd meter thresholds)
- Activate / deactivate venue listing

### Scraper Status Dashboard
- Per-venue scraper health status
- Last successful sync timestamp
- Failure count
- Venues with 3+ consecutive failures flagged in red
- Manual retry button per venue
- Global scraper queue status

---

## User Management

### User List
- Table of all registered users
- Columns: username, phone, date registered, last active, status (active / suspended / banned)
- Search by name, username, phone number
- Filter by status, date range, premium status

### User Profile View
- Full profile details
- Check-in history
- Post history
- Report history (how many times this user has been reported)
- Actions: suspend (temporary), ban (permanent), reset profile photo, force logout

### Age Verification
- Flag users where DOB is suspected to be falsified
- Manual review and ban if confirmed underage

---

## Content Moderation

### Reported Content Queue
- Queue of user-reported posts, stories, comments
- Columns: content type, reported by, report reason, timestamp, status
- Actions per item: approve (keep content), remove, warn user, suspend user

### Report Reasons
- Inappropriate content
- Underage user suspected
- Spam
- Harassment
- Fake venue tag

### Auto-Moderation
- Posts flagged by keyword filter go into review queue automatically
- Profanity filter active on captions and comments

---

## DJ & Band Management

### DJ / Band List
- Table of all auto-generated and claimed DJ/band profiles
- Columns: name, type (DJ/band), profile source (auto/claimed), linked venues, upcoming gigs, status
- Search by name, genre, venue

### Edit DJ / Band Profile
- Edit name, type, genre tags
- Manually link to a venue event
- Upload profile photo (override scraped)
- Merge duplicate profiles (when same DJ scraped under slightly different names)
- Activate / deactivate profile

---

## Platform Health Dashboard

### Real-Time Overview
- Total active users right now (checked in or app open)
- Total check-ins today
- Total check-ins this week
- Most active venue right now (by check-ins)
- Scraper health summary (how many venues have sync errors)

### Growth Metrics
- Daily Active Users (DAU) — chart over last 30 days
- New user registrations per day
- Total venues on platform
- Total posts today
- Total check-ins today

### DAU Target Tracker
- Progress bar showing current DAU vs 1,000 DAU goal
- When 1,000 DAU is reached → trigger Phase 2 (venue commerce) planning

---

## Notifications & Alerts (Admin)

Admin receives alerts for:
- Instagram scraper failure (per venue, after 1 failed attempt)
- Escalated scraper failure (3 consecutive failures — higher priority)
- New user report submitted
- Reported content queue exceeds 20 items unreviewed
- User banned (confirmation log)

---

## Waitlist Management

- View all waitlist email signups from barblink.com
- Export to CSV
- Send bulk email announcement (via Mailgun) when app launches
- View Mailgun delivery stats (sent, opened, bounced)
