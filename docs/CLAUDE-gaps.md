# Claude Code Instructions — Remaining Gaps

Read `CLAUDE-backend.md`, `docs/02-features-social.md`, and `docs/05-tech-stack.md` before starting.
Address each gap in the order listed below. Each section is independent — complete one fully before moving to the next.

---

## Gap 1 — Chat: Replace Polling with Socket.io

**Problem:** Chat currently uses 5-second polling for new messages. The spec requires Socket.io real-time delivery.

**Reference:** `docs/05-tech-stack.md` — Real-time: Socket.io

### Backend (chat-service)

The checkin-service already runs Socket.io. The chat-service needs its own Socket.io gateway.

Add to `services/chat-service/src/`:

```ts
// chat.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGateway {
  @WebSocketServer() server: Server

  // On connect: verify JWT, join user to their conversation rooms
  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token
    try {
      const payload = this.jwtService.verify(token)
      client.data.userId = payload.sub
      // Join all conversation rooms this user belongs to
      const conversations = await this.chatService.getUserConversations(payload.sub)
      conversations.forEach(c => client.join(`conversation:${c.id}`))
    } catch {
      client.disconnect()
    }
  }

  // Client sends message via socket
  @SubscribeMessage('message.send')
  async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string, body: string, sharedPostId?: string, sharedVenueId?: string }) {
    const message = await this.chatService.createMessage({
      conversationId: data.conversationId,
      senderId: client.data.userId,
      body: data.body,
      sharedPostId: data.sharedPostId,
      sharedVenueId: data.sharedVenueId,
    })
    // Broadcast to everyone in the conversation room (including sender)
    this.server.to(`conversation:${data.conversationId}`).emit('message.new', message)
    return message
  }

  // Client reacts to message
  @SubscribeMessage('message.react')
  async handleReaction(@ConnectedSocket() client: Socket, @MessageBody() data: { messageId: string, emoji: string }) {
    const reaction = await this.chatService.upsertReaction(data.messageId, client.data.userId, data.emoji)
    const message = await this.chatService.getMessage(data.messageId)
    this.server.to(`conversation:${message.conversationId}`).emit('message.reaction', {
      messageId: data.messageId,
      reactions: await this.chatService.getReactions(data.messageId)
    })
  }

  // Typing indicator
  @SubscribeMessage('typing.start')
  handleTypingStart(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    client.to(`conversation:${data.conversationId}`).emit('conversation.typing', {
      userId: client.data.userId,
      conversationId: data.conversationId,
      isTyping: true
    })
  }

  @SubscribeMessage('typing.stop')
  handleTypingStop(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    client.to(`conversation:${data.conversationId}`).emit('conversation.typing', {
      userId: client.data.userId,
      conversationId: data.conversationId,
      isTyping: false
    })
  }

  // When user creates a new conversation: join them to the new room
  joinConversation(userId: string, conversationId: string) {
    const sockets = this.server.sockets.sockets
    sockets.forEach(socket => {
      if (socket.data.userId === userId) {
        socket.join(`conversation:${conversationId}`)
      }
    })
  }
}
```

Also keep the existing REST endpoint `POST /conversations/:id/messages` working for cases where the socket connection drops — it should also emit via Socket.io after saving.

### Mobile (Chat screen)

Replace the 5-second polling interval with Socket.io:

```ts
// apps/mobile/src/screens/ChatScreen.tsx

import { io, Socket } from 'socket.io-client'

// Connect on mount
useEffect(() => {
  const socket: Socket = io(`${API_BASE_URL}/chat`, {
    auth: { token: accessToken },
    transports: ['websocket'],
  })

  socket.on('connect', () => {
    console.log('Chat socket connected')
  })

  socket.on('message.new', (message: Message) => {
    setMessages(prev => [...prev, message])
    flatListRef.current?.scrollToEnd()
  })

  socket.on('message.reaction', ({ messageId, reactions }) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m))
  })

  socket.on('conversation.typing', ({ userId, isTyping }) => {
    setTypingUsers(prev => isTyping
      ? [...new Set([...prev, userId])]
      : prev.filter(id => id !== userId)
    )
  })

  socket.on('disconnect', () => {
    console.log('Chat socket disconnected')
  })

  socketRef.current = socket
  return () => { socket.disconnect() }
}, [conversationId, accessToken])

// Send message via socket (not HTTP)
const sendMessage = (body: string) => {
  socketRef.current?.emit('message.send', { conversationId, body })
  // Optimistically add to UI immediately
  setInputText('')
}

// Show typing indicator
const handleTyping = (text: string) => {
  setInputText(text)
  socketRef.current?.emit('typing.start', { conversationId })
  // Clear typing after 2 seconds of no input
  clearTimeout(typingTimer.current)
  typingTimer.current = setTimeout(() => {
    socketRef.current?.emit('typing.stop', { conversationId })
  }, 2000)
}
```

Add typing indicator UI below the message list:
```tsx
{typingUsers.length > 0 && (
  <Text style={styles.typingIndicator}>
    {typingUsers.length === 1 ? 'Someone is typing...' : 'Several people are typing...'}
  </Text>
)}
```

### Nginx (update WebSocket route)

Add `/chat` namespace to the existing WebSocket location block:
```nginx
location /socket.io/ {
  proxy_pass http://chat-service:3007;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
}
```

---

## Gap 2 — Confirm & Fix Missing Redpanda Topics

**Problem:** Build summary only shows 12 topics. 4 are missing: `story.created`, `friend.request_accepted`, `dj.gig_added`, `event.rsvp`.

Check each service and add the missing publish calls:

### social-service — add `story.created`
```ts
// After inserting story in stories endpoint:
await publishEvent('story.created', { storyId: story.id, userId: story.userId })
```

### user-service — add `friend.request_accepted`
```ts
// After updating follow status to 'accepted':
await publishEvent('friend.request_accepted', { fromUserId: follow.followerId, toUserId: follow.followingId })
```

### dj-service — add `dj.gig_added`
```ts
// After inserting new dj_event (both via DJ portal and auto from scraper):
await publishEvent('dj.gig_added', { djId, venueId, eventDate, djName })
```

### events-service — add `event.rsvp`
```ts
// After inserting event_rsvp:
await publishEvent('event.rsvp', { eventId, userId, eventName, venueId })
```

### notification-service — add consumers for new topics

Add these cases to the Redpanda consumer switch:

```ts
case 'story.created':
  // Notify followers: "X posted a new story"
  // Only notify if user has followers — fetch from user-service
  const followers = await fetchFollowers(payload.userId)
  for (const followerId of followers) {
    await createInAppNotification(followerId, 'new_story', {
      title: 'New story',
      body: `${payload.username} posted a new story`,
      data: { storyId: payload.storyId }
    })
  }
  break

case 'friend.request_accepted':
  // Notify the person who sent the follow request
  await sendPush(payload.fromUserId, 'Follow accepted', `Your follow request was accepted`)
  await createInAppNotification(payload.fromUserId, 'follow_accepted', payload)
  break

case 'dj.gig_added':
  // Notify all followers of this DJ
  const djFollowers = await fetchDJFollowers(payload.djId)
  for (const followerId of djFollowers) {
    await createInAppNotification(followerId, 'dj_gig', {
      title: 'Upcoming gig',
      body: `${payload.djName} is playing at ${payload.venueName} on ${payload.eventDate}`,
      data: { djId: payload.djId, venueId: payload.venueId }
    })
  }
  break

case 'event.rsvp':
  // Notify friends of the user who RSVPd: "X is going to [Event]"
  const friends = await fetchFollowers(payload.userId) // people who follow them
  for (const friendId of friends) {
    await createInAppNotification(friendId, 'friend_rsvp', {
      title: 'Friend going out',
      body: `${payload.username} is going to ${payload.eventName}`,
      data: { eventId: payload.eventId }
    })
  }
  break
```

---

## Gap 3 — Platform Settings Encryption

**Problem:** Current `PlatformSetting` model stores values as plain text. Spec requires AES-256-GCM encryption for secrets with a full audit log.

### Step 1: Update Prisma schema in auth-service (or whichever service manages settings)

```prisma
model PlatformSetting {
  id          String   @id @default(uuid())
  key         String   @unique
  value       String   // AES-256-GCM encrypted if isSecret = true
  description String?
  category    String
  isSecret    Boolean  @default(true)
  isActive    Boolean  @default(true)
  updatedBy   String?  // admin account ID
  updatedAt   DateTime @updatedAt
}

model SettingsAuditLog {
  id           String   @id @default(uuid())
  settingKey   String
  action       String   // created | updated | deleted | revealed
  adminId      String
  adminName    String
  oldValueHash String?  // SHA-256 of old value — NEVER store plaintext
  createdAt    DateTime @default(now())
}
```

Run migration: `npx prisma migrate dev --name encrypt-platform-settings`

### Step 2: Encryption utility

Add to `packages/shared-utils/src/crypto.ts`:

```ts
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

const KEY = Buffer.from(process.env.SETTINGS_ENCRYPTION_KEY!, 'utf8') // exactly 32 chars
const ALGO = 'aes-256-gcm'

export function encrypt(plaintext: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGO, KEY, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decrypt(ciphertext: string): string {
  const [ivHex, tagHex, dataHex] = ciphertext.split(':')
  const decipher = createDecipheriv(ALGO, KEY, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  return decipher.update(Buffer.from(dataHex, 'hex')).toString('utf8') + decipher.final('utf8')
}

export function hashForAudit(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}
```

### Step 3: Migrate existing plain-text values

Write a one-time migration script `scripts/encrypt-existing-settings.ts`:
```ts
// For each existing PlatformSetting where isSecret = true:
// 1. Read current plain-text value
// 2. Encrypt it
// 3. Update the record
// Run once: npx ts-node scripts/encrypt-existing-settings.ts
```

### Step 4: Update settings service methods

```ts
// settings.service.ts

async updateSetting(key: string, value: string, adminId: string, adminName: string) {
  const existing = await prisma.platformSetting.findUnique({ where: { key } })

  const newValue = existing?.isSecret ? encrypt(value) : value
  const oldValueHash = existing ? hashForAudit(existing.isSecret ? decrypt(existing.value) : existing.value) : null

  await prisma.platformSetting.upsert({
    where: { key },
    create: { key, value: newValue, category: 'general', isSecret: true },
    update: { value: newValue, updatedBy: adminId }
  })

  await prisma.settingsAuditLog.create({
    data: { settingKey: key, action: existing ? 'updated' : 'created', adminId, adminName, oldValueHash }
  })

  // Invalidate Redis cache
  await redis.del(`cfg:${key}`)
}

async getSetting(key: string): Promise<string> {
  // Check Redis first
  const cached = await redis.get(`cfg:${key}`)
  if (cached) return cached

  const setting = await prisma.platformSetting.findUnique({ where: { key } })
  if (!setting) throw new Error(`Setting not found: ${key}`)

  const value = setting.isSecret ? decrypt(setting.value) : setting.value

  // Cache 5 minutes
  await redis.setEx(`cfg:${key}`, 300, value)
  return value
}

async revealSetting(key: string, adminId: string, adminName: string): Promise<string> {
  const setting = await prisma.platformSetting.findUnique({ where: { key } })
  if (!setting) throw new Error('Not found')

  // Log the reveal action
  await prisma.settingsAuditLog.create({
    data: { settingKey: key, action: 'revealed', adminId, adminName }
  })

  return setting.isSecret ? decrypt(setting.value) : setting.value
}
```

### Step 5: Update admin Settings page

- Add 👁 eye icon button next to each secret value → calls GET /admin/settings/:key/reveal
- Show audit log table at bottom of settings page: who changed/revealed what and when
- GET /admin/settings/audit-log → last 100 entries

---

## Gap 4 — Neighbourhood Groups

**Reference:** `docs/02-features-social.md` — Community section

KL neighbourhoods: Bukit Bintang, KLCC, Bangsar, Mont Kiara, Sri Hartamas, Desa ParkCity
Colombo neighbourhoods: Colombo 3, Colombo 7, Nawala, Nugegoda, Rajagiriya

### Backend (community-service)

Add to Prisma schema:
```prisma
model NeighbourhoodGroup {
  id        String   @id @default(uuid())
  name      String
  area      String   @unique
  country   String   @default("MY") // MY or LK
  createdAt DateTime @default(now())
}
```

Seed on first run:
```ts
const KL_NEIGHBOURHOODS = ['Bukit Bintang', 'KLCC', 'Bangsar', 'Mont Kiara', 'Sri Hartamas', 'Desa ParkCity']
const COLOMBO_NEIGHBOURHOODS = ['Colombo 3', 'Colombo 7', 'Nawala', 'Nugegoda', 'Rajagiriya']
// Insert all with appropriate country code
```

New endpoints:

**GET /neighbourhoods**
```ts
// Returns all neighbourhood groups with:
// - member count (users whose most-visited venue is in this area)
// - active tonight count (users currently checked in at venues in this area)
// - country filter support: ?country=MY or ?country=LK
```

**GET /neighbourhoods/:area/feed**
```ts
// Returns recent posts and check-ins from venues in this area
// Logic:
// 1. Get all venue IDs in this area (call venue-service)
// 2. Get recent check-ins at those venues (call checkin-service)
// 3. Get recent posts tagged at those venues (call social-service)
// 4. Interleave check-ins and posts, sorted by created_at DESC
// 5. Return last 50 items
```

### Mobile (new screen)

Add Neighbourhood screen accessible from Profile tab or Community section:

```tsx
// NeighbourhoodsScreen.tsx

// Header: "Your Scene" with country toggle (MY 🇲🇾 | LK 🇱🇰)
// List of neighbourhood cards:
//   - Area name (large, Syne bold)
//   - "X active tonight" (green dot + count)
//   - "X members"
//   - Tap → opens neighbourhood feed

// NeighbourhoodFeedScreen.tsx
// Same layout as Blink Feed but filtered to this area
// Header: area name + active count
// Feed: interleaved posts + check-in cards from this area
```

Add navigation: Profile tab → "My Scene" button → NeighbourhoodsScreen

### Neighbourhood Leaderboard

Update the existing leaderboard to support neighbourhood filtering:

**GET /leaderboard/weekly?area=Bukit+Bintang**
```ts
// Filter leaderboard to users whose most frequent check-in area = requested area
// "Most frequent area" = the area with the most check-ins in the last 7 days
```

Add area filter dropdown to the mobile Leaderboard screen.

---

## Gap 5 — Setlist Posting

**Reference:** `docs/02-features-social.md` — DJ Profiles section

Users can post what songs were played at a DJ's set. Only unlocked after checking in on a night that DJ performed.

### Backend (dj-service)

Add to Prisma schema:
```prisma
model Setlist {
  id        String   @id @default(uuid())
  djId      String
  eventId   String?
  userId    String   // posted by this user
  songs     String[] // array of song titles
  notes     String?
  createdAt DateTime @default(now())

  @@index([djId])
  @@index([eventId])
}
```

**POST /djs/:id/setlist**
```ts
// Auth: required
// Body: { eventId?: string, songs: string[], notes?: string }
// Validation:
//   1. Find DJ event on this date at a venue
//   2. Check that requesting user has an active or recent check-in at that venue on that date
//   3. Max 50 songs in a setlist
//   4. Each song max 100 chars
// Logic: Insert setlist record
// Response: created setlist
```

**GET /djs/:id/setlists**
```ts
// Returns all setlists for this DJ
// Grouped by eventId (event date + venue)
// Each setlist: songs list, notes, submitted by username, created_at
// Paginated: 10 setlists per page
```

### Mobile (new flow)

Add setlist posting entry point from DJ profile screen:

```tsx
// On DJ profile screen, below ratings section:
<TouchableOpacity onPress={() => navigation.navigate('PostSetlist', { djId, djName })}>
  <Text>+ Post setlist</Text>
</TouchableOpacity>

// PostSetlistScreen.tsx
// Header: "Setlist for [DJ Name]"
// Event selector: dropdown of recent DJ events (last 30 days)
// Songs input: dynamic list — tap "+ Add song", type song name, tap to remove
//   - Min 1 song, max 50
//   - Each row: song number, text input, remove button
// Notes field: optional textarea ("Add notes about the set...")
// Submit button → POST /djs/:id/setlist
// On success: show success toast, navigate back to DJ profile

// On DJ profile screen, show setlists section:
// "Recent Setlists" heading
// Each setlist card: event date + venue name, "X songs", submitted by @username
// Tap → expands to show full song list
```

---

## Gap 6 — "Who's Hot This Week" DJ Trending Screen

**Reference:** `docs/02-features-social.md` — DJ Profiles section

### Backend (dj-service)

The endpoint `GET /djs/trending` should already be specced. Verify it exists and implements this logic:

```ts
// GET /djs/trending
// Logic:
// 1. Get all DJ events from the last 7 days
// 2. For each DJ event: count check-ins at that venue on that event date
//    (call checkin-service: GET /checkins/count?venueId=X&date=Y)
// 3. Sum check-ins across all events per DJ
// 4. Sort by total check-in count DESC
// 5. Return top 20 DJs with:
//    { dj: DJProfile, totalCheckins: number, gigs: DJEvent[], rank: number }
// Cache result in Redis for 1 hour (key: trending:djs:week)
// Invalidate cache when new check-in event arrives from Redpanda
```

### Mobile (new screen)

Add "Who's Hot" screen accessible from Discover tab or DJ discovery section:

```tsx
// HotDJsScreen.tsx

// Header: "Who's Hot This Week 🔥"
// Subtitle: "Ranked by crowd turnout"
// Refresh: pull-to-refresh

// List of DJ cards (ranked):
// Rank badge (🥇🥈🥉 for top 3, number for rest)
// DJ avatar (circle, purple border)
// DJ name (Syne bold)
// Genre pills
// "X people attended their sets this week" (crowd count)
// Recent gig: venue + date
// Follow button (toggle)

// Sticky filter bar below header:
// "All" | "DJs" | "Live Bands" | "EDM" | "Hip-Hop" | "R&B" | "House" | "Jazz"
// Filters call /djs/trending?type=dj or ?genre=edm

// On tap → DJ profile screen
```

Add navigation entry point:
- In Discover tab, add "🔥 Who's Hot This Week" banner card at top of DJ section
- Tap → HotDJsScreen

---

## Testing Checklist

After completing all gaps, verify:

**Chat (Gap 1):**
- [ ] Open two devices/simulators, log in as different users
- [ ] Send message from device A — appears on device B without refresh
- [ ] Typing indicator appears on device B when device A is typing
- [ ] Reaction to a message updates in real-time on both devices
- [ ] Socket reconnects automatically after network interruption

**Redpanda events (Gap 2):**
- [ ] Post a story → follower receives in-app notification
- [ ] Accept a follow request → requester receives "accepted" notification
- [ ] Admin adds DJ gig → DJ followers receive notification
- [ ] RSVP to event → friends receive "X is going" notification
- [ ] Check notification-service logs for any consumer errors

**Settings encryption (Gap 3):**
- [ ] Update a secret setting value in admin panel
- [ ] Check DB directly — value should NOT be readable as plain text
- [ ] Reveal the value in admin panel — should show original plain text
- [ ] Check settings_audit_log — reveal action should be logged
- [ ] Update a value — old_value_hash should be present in audit log
- [ ] Services should still read config correctly after encryption migration

**Neighbourhood groups (Gap 4):**
- [ ] GET /neighbourhoods returns all 11 areas (6 KL + 5 Colombo)
- [ ] GET /neighbourhoods/Bukit+Bintang/feed returns posts + check-ins from that area
- [ ] Neighbourhood screen shows in mobile app
- [ ] Leaderboard area filter works correctly

**Setlists (Gap 5):**
- [ ] User who checked in at a venue on a DJ event night can post setlist
- [ ] User who did NOT check in cannot post setlist (403)
- [ ] Setlist appears on DJ profile screen
- [ ] Songs list renders correctly

**Who's Hot (Gap 6):**
- [ ] GET /djs/trending returns DJs ranked by weekly check-in count
- [ ] HotDJs screen renders correctly
- [ ] Genre filter works
- [ ] Follow button updates correctly
- [ ] Tapping DJ navigates to DJ profile
