# 07 — API Structure

## Base URL
```
Production:  https://api.barblink.com/v1
Development: http://localhost:3000/v1
```

## Auth Headers
All protected routes require:
```
Authorization: Bearer <access_token>
```

## Response Format
```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

---

## auth-service (port 3001)

```
POST   /auth/register              Register new user (with DOB 18+ check)
POST   /auth/send-otp              Send OTP to phone number
POST   /auth/verify-otp            Verify OTP code
POST   /auth/login                 Login with phone + password
POST   /auth/google                Google OAuth login
POST   /auth/apple                 Apple OAuth login
POST   /auth/refresh               Refresh access token
POST   /auth/logout                Invalidate refresh token
```

---

## user-service (port 3002)

```
GET    /users/me                   Get own profile
PUT    /users/me                   Update own profile
GET    /users/:username            Get user profile by username
GET    /users/search               Search users (query, by name/username/phone)
GET    /users/suggestions          People You May Know

GET    /users/me/qr                Get own QR code
POST   /users/qr/connect           Connect via QR code scan

POST   /users/:id/follow           Send follow request
DELETE /users/:id/follow           Unfollow
GET    /users/me/followers         Get own followers
GET    /users/me/following         Get own following
GET    /users/me/requests          Get pending follow requests
PUT    /users/requests/:id/accept  Accept follow request
PUT    /users/requests/:id/reject  Reject follow request

GET    /users/me/trusted-circle    Get trusted circle
POST   /users/trusted-circle/:id   Add to trusted circle
DELETE /users/trusted-circle/:id   Remove from trusted circle

POST   /users/me/going-tonight     Set going tonight status
DELETE /users/me/going-tonight     Clear going tonight status
POST   /users/me/home-safe         Send I'm Home Safe ping

GET    /users/me/bookmarks         Get bookmarked posts
POST   /users/bookmarks/:postId    Bookmark a post
DELETE /users/bookmarks/:postId    Remove bookmark
```

---

## venue-service (port 3003)

```
GET    /venues                     List all venues (paginated)
GET    /venues/:id                 Get venue by ID
GET    /venues/:id/photos          Get venue photos
GET    /venues/:id/reviews         Get venue reviews
POST   /venues/:id/reviews         Post a review (auth required)
GET    /venues/:id/photo-wall      Get all user posts tagged at this venue
POST   /venues/:id/follow          Follow a venue
DELETE /venues/:id/follow          Unfollow a venue

ADMIN:
POST   /admin/venues               Create venue (triggers scrape)
PUT    /admin/venues/:id           Update venue fields
DELETE /admin/venues/:id           Deactivate venue
POST   /admin/venues/:id/scrape/instagram   Manually trigger Instagram re-scrape
POST   /admin/venues/:id/scrape/google      Manually trigger Google re-scrape
GET    /admin/venues/scraper-status         Get scraper health for all venues
```

---

## discovery-service (port 3004)

```
GET    /discovery/nearby           Nearby venues (lat, lng, radius)
GET    /discovery/search           Full-text search venues + DJs
GET    /discovery/map              Venues for map view with crowd data
GET    /discovery/crowd/:venueId   Get live crowd meter for venue
```

---

## social-service (port 3005)

```
GET    /feed                       Get personalised home feed
GET    /posts/:id                  Get single post
POST   /posts                      Create post (photo/video/drink/poll/repost)
DELETE /posts/:id                  Delete own post

POST   /posts/:id/like             Like a post
DELETE /posts/:id/like             Unlike a post
GET    /posts/:id/comments         Get comments
POST   /posts/:id/comments         Add comment

GET    /stories                    Get stories from friends + followed venues
POST   /stories                    Create a story
POST   /stories/:id/view           Mark story as viewed

POST   /checkins/:id/react         React to a friend's check-in (emoji)
```

---

## checkin-service (port 3006)

```
POST   /checkins                   Check in to a venue (GPS validated)
DELETE /checkins/:id               Check out
GET    /checkins/active            Who's out tonight (friends)
GET    /checkins/venue/:venueId    Active check-ins at a venue

POST   /group-checkins             Create group check-in
POST   /group-checkins/:id/join    Join a group check-in
GET    /group-checkins/:id         Get group check-in details
```

---

## dj-service (port 3010)

```
GET    /djs                        List all DJ/band profiles
GET    /djs/:id                    Get DJ/band profile
GET    /djs/search                 Search by name or genre
GET    /djs/trending               Who's Hot This Week
GET    /djs/calendar               My followed DJs' upcoming gigs
GET    /djs/:id/events             Get DJ's upcoming events
POST   /djs/:id/follow             Follow a DJ/band
DELETE /djs/:id/follow             Unfollow
POST   /djs/:id/rate               Rate a DJ (requires check-in on event night)
POST   /djs/:id/setlist            Post a setlist for an event
```

---

## events-service (port 3011)

```
GET    /events                     What's On Tonight (all KL events)
GET    /events/:id                 Get event details
POST   /events/:id/rsvp            RSVP to an event (I'm Going)
DELETE /events/:id/rsvp            Cancel RSVP
GET    /events/:id/attendees       See who's going
```

---

## community-service (port 3012)

```
GET    /leaderboard/weekly         Weekly leaderboard (KL-wide)
GET    /leaderboard/weekly/:area   Neighbourhood leaderboard

GET    /users/:id/streak           Get user's streak
GET    /users/:id/badges           Get user's badges
GET    /users/:id/passport         Get nightlife passport (venue map data)

GET    /collections                Browse public venue collections
GET    /collections/:id            Get a collection
POST   /collections                Create a collection
PUT    /collections/:id            Update a collection
DELETE /collections/:id            Delete a collection
POST   /collections/:id/venues/:venueId  Add venue to collection
DELETE /collections/:id/venues/:venueId  Remove venue from collection

GET    /neighbourhoods             List all neighbourhood groups
GET    /neighbourhoods/:area/feed  Get neighbourhood feed
```

---

## chat-service (port 3007)

```
GET    /conversations              Get all conversations
GET    /conversations/:id/messages Get messages (paginated)
POST   /conversations/dm           Start or get DM with a user
POST   /conversations/group        Create group chat
POST   /conversations/:id/messages Send a message
POST   /messages/:id/react         React to a message

WebSocket events (Socket.io):
  message.new
  message.reaction
  conversation.typing
```

---

## notification-service (port 3008)

```
GET    /notifications              Get in-app notifications
PUT    /notifications/:id/read     Mark as read
PUT    /notifications/read-all     Mark all as read

POST   /waitlist                   Add email to waitlist (public, landing page)
```

---

## scraper-service (port 3009)

```
Internal only — not exposed through API gateway

POST   /scrape/instagram/:venueId  Scrape Instagram for venue
POST   /scrape/google/:venueId     Scrape Google for venue
GET    /scrape/status              Get all venue scraper statuses
GET    /scrape/queue               Get current scraper queue
```

---

## Admin Endpoints (admin panel only, separate auth)

```
GET    /admin/dashboard            Platform health overview
GET    /admin/users                User list with filters
GET    /admin/users/:id            User detail + actions
POST   /admin/users/:id/suspend    Suspend user
POST   /admin/users/:id/ban        Ban user
GET    /admin/reports              Reported content queue
PUT    /admin/reports/:id          Action on a report (approve/remove)
GET    /admin/waitlist             Waitlist email list
POST   /admin/waitlist/export      Export waitlist to CSV
POST   /admin/waitlist/announce    Send launch email to all waitlist
GET    /admin/djs                  DJ/band profile list
PUT    /admin/djs/:id              Edit DJ/band profile
POST   /admin/djs/merge            Merge duplicate DJ profiles
```
