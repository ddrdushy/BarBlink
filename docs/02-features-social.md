# 02 — Social Features

## Home Feed

### Layout — "Blink Feed"
A unique mixed layout — not a copy of Instagram:
- **Stories strip** at top — horizontal scroll, circular avatars with neon purple ring, live green dot for checked-in friends
- **Hero card** — first content item is always full-width, tall, cinematic
- **Below hero** — mix of full-width post cards and 2-column compact check-in cards
- Feed content types interleaved: posts → check-in pair → buddy activity card → post → repeat

### Content Types in Feed
1. Friend photo/video posts
2. Friend check-ins
3. Stories/moments
4. Bar Buddy activity (e.g. "Marcus is looking for a buddy tonight")

---

## Post Cards vs Check-in Cards

### Photo/Video Post Card
- Full-width or hero-size
- Large photo/video area with overlay
- Friend name, caption, venue tag (if tagged)
- Like count, comment count, share button
- Drink rating badge (if it is a drink post)

### Check-in Card (completely different design from posts)
- Compact — two per row (half width)
- No photo
- Friend avatar + "is at" text
- Venue name in neon purple (large, bold)
- Live crowd indicator dot (green / amber / red) + status label
- Timestamp
- Subtle neon purple border

### Bar Buddy Activity Card
- Full-width, shorter height
- Warm amber accent (distinct from purple brand)
- Friend avatar + "is looking for a buddy tonight"
- Vibe tags (genre, area)
- "Send Request" button

---

## Stories

- 24-hour expiry
- Visible to friends only (not public)
- Venue stories — bars and clubs can post stories that their followers see
- Story ring shows neon purple glow when unwatched
- Green dot on story avatar = friend currently checked in somewhere

---

## Posts & Content Creation

- Photo and video posts
- Caption with friend tagging
- Venue tagging (links to venue page)
- **Drink rating posts** — photo + star rating + drink name
- **Poll posts** — "Which bar tonight?" with venue options
- **Repost / re-share** a friend's post to your own feed
- **Save / bookmark** posts for later (private collection)
- **Night recap** — auto-generated memory card at end of night, compiled from check-ins and tagged photos from that evening
- React to a friend's check-in with a quick emoji (no comment needed)

---

## Friends & Social Graph

### Following / Friends
- Follow friends (one-way follow, Instagram-style)
- Friend requests show in notifications
- Accept / reject friend requests

### Finding Friends
- Search by name
- Search by username
- Search by phone number
- **QR code connect** — show your QR in-app, another Barblink user scans to instantly connect (for in-person moments at bars)
- **People You May Know** — suggestions based on mutual friends or shared venues visited

### Social Signals
- Active tonight indicator — see which friends are currently out
- "Last seen at" on user profiles (with privacy toggle — user can disable)

---

## Going Out

- **"Going tonight" status** — let friends know you are heading out, optionally tag a venue
- **"Who's joining me?"** — post from a venue page, invite friends to join, visible in their feed

---

## Check-In

### How Check-In Works
Check-in is a **one-tap status update** — no QR code, no scanning. The user taps "I'm Here" on a venue page and their status is instantly updated. The platform counts active check-ins per venue to calculate the live crowd meter.

### Solo Check-In
- User opens a venue page
- Taps the "I'm Here" button (one tap, no confirmation needed)
- Status immediately updates — user is now "checked in" at that venue
- Venue's live check-in counter increments by 1
- Appears in friends' feed as a check-in card
- Appears in "Who's Out Tonight" strip on home feed
- Check-in auto-expires after 3 hours if user does not manually check out
- User can tap "Leave" to check out early

### Group Check-In
- Create group → invite Barblink friends
- Group leader taps "Check In Group" on the venue page
- All accepted group members are checked in together with one tap
- Shared photo album auto-created for the group

### Crowd Meter Calculation
- Active check-ins = all users checked in within the last 3 hours
- Count refreshes in real-time via Redis
- Thresholds set per venue based on admin-configured crowd capacity

---

## Safety Features

### Trusted Circle
- User designates a private close-friends list
- Trusted circle always sees user's real-time check-in location when active
- Regular followers only see the venue name, not live tracking

### "I'm Home Safe" Ping
- One-tap button at end of night
- Sends a status notification to the user's trusted circle
- No message required — just a ping

---

## Chat

- Direct messages with Barblink friends
- Group chats (create a squad for the night)
- Share venue pages in chat
- Share posts in chat
- Message reactions

---

## Bar Buddy (Premium — Phase 2)

A matching feature to find drinking companions for the night.

**Flow:**
1. Enable Bar Buddy for tonight
2. Set vibe: Solo / Small Group + music preference + area of KL
3. Barblink matches nearby Premium users with same vibe
4. View matched profile (age, vibe, preferred venue)
5. Send Buddy Request
6. If accepted → start chat → plan the night
7. Meet at venue → group check-in together

**Privacy rules:**
- Exact location never shared — only area (e.g. "Bukit Bintang")
- Users can block / report matches
- Profile only visible while Bar Buddy mode is active

---

## DJ & Live Band Profiles

### Phase 1 — Fully Automatic (no DJ onboarding required)

**Auto-profile creation from Instagram scrape:**
- When scraping a venue's Instagram, extract DJ/band names from captions and posts
- Auto-create a DJ or band profile if one does not exist yet
- Link the DJ profile to the venue event automatically
- Pull profile photo from tagged posts or Instagram mentions

**DJ / Band Profile Page (auto-generated):**
- Name
- Type: DJ / Live Band
- Genre tags (extracted from Instagram captions)
- Upcoming performances (venue + date + time)
- Past performance history
- Which venues they regularly play at
- Aggregate user rating (vibe, music quality, crowd energy)

**DJ Calendar:**
- Pulled from venue Instagram scrape
- Visible on venue page and on DJ's own profile page
- Shows who is performing where and when across all venues

**User Discovery:**
- Search DJs and bands by name
- Filter by genre (EDM, hip-hop, R&B, house, live band, etc.)
- Follow a DJ / band — get notified when they have an upcoming gig
- "Your Favourite DJs This Week" — consolidated calendar of all followed DJs upcoming gigs
- **"Who's Hot This Week"** — trending DJs ranked by check-in count on their event nights

**DJ / Band Rating (by users who attended):**
- Vibe rating (1–5)
- Music quality rating (1–5)
- Crowd energy rating (1–5)
- Rating only unlocked after user checks in on a night that DJ performed

**Setlist Sharing:**
- Users can post what songs were played at a set
- Attached to that DJ's profile and the event

### Phase 2 — DJ / Band Self-Onboarding
- DJs and bands claim their auto-generated profile
- Add own photos, bio, social links, music samples
- Self-manage upcoming gigs
- Promoted DJ profiles (paid placement)

---

## Events & "What's On Tonight"

- **Dedicated events feed** — standalone screen, not just on venue pages
- Shows all events happening tonight across KL venues
- Filter by: area, genre, venue type, DJ / band
- **Event RSVP** — "I'm Going" button; friends can see who is attending
- **Event countdown** on venue page — e.g. "Doors open in 2hr 30min"
- **Ticketed events** — link to external ticket purchase (Phase 2)

---

## Discovery & Gamification

### Nightlife Passport
- Visual map on user's profile
- Every venue ever checked into is pinned on the map
- Collectible and shareable — "I've been to 23 bars in KL"

### Streaks
- Check in on consecutive nights to build a streak
- Earn streak badges (3 nights, 7 nights, 30 nights)
- Shown on user profile

### Venue Collections
- Users curate their own lists: "Best Rooftop Bars in KL", "Hidden Gems", "Best for Live Music"
- Collections are shareable on the feed
- Other users can follow or save a collection

### Barblink Verified Regular Badge
- Automatically awarded when a user reaches 50+ check-ins at a single venue
- Shown on their profile and on that venue's page

### Weekly Leaderboard
- Most active users in KL this week (by check-ins + posts)
- Neighbourhood sub-leaderboards (Bukit Bintang, KLCC, Bangsar, Mont Kiara, etc.)
- Resets every Monday

---

## Community

### Neighbourhood Groups
- Auto-groups based on most-visited area
- Areas: Bukit Bintang, KLCC, Bangsar, Mont Kiara, Sri Hartamas, Desa ParkCity
- Group feed shows posts and check-ins from users in that area
- Users can browse multiple neighbourhood groups

---

## User Profile

- Profile photo + username + bio
- "Going tonight" status badge
- Nightlife passport map
- Check-in history (list view)
- Posts and stories archive
- Friends list
- Drink preferences
- Streaks and badges
- Venue collections
- Barblink Verified Regular badges earned
- Trusted circle (private, not visible to others)
