# 06 — Database Schema

Each microservice has its own PostgreSQL database. Schemas are defined per service below.

---

## auth-service

```sql
users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone           VARCHAR(20) UNIQUE NOT NULL,
  phone_verified  BOOLEAN DEFAULT FALSE,
  date_of_birth   DATE NOT NULL,
  is_18_plus      BOOLEAN GENERATED ALWAYS AS (date_of_birth <= CURRENT_DATE - INTERVAL '18 years') STORED,
  password_hash   TEXT,
  google_id       TEXT UNIQUE,
  apple_id        TEXT UNIQUE,
  status          ENUM('active','suspended','banned') DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
)

otp_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       VARCHAR(20) NOT NULL,
  code        VARCHAR(6) NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
)

refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  token_hash  TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
)
```

---

## user-service

```sql
profiles (
  id               UUID PRIMARY KEY,
  username         VARCHAR(30) UNIQUE NOT NULL,
  display_name     VARCHAR(60),
  bio              TEXT,
  avatar_url       TEXT,
  drink_prefs      TEXT[],
  going_tonight    BOOLEAN DEFAULT FALSE,
  going_venue_id   UUID,
  last_seen_venue  UUID,
  show_last_seen   BOOLEAN DEFAULT TRUE,
  is_home_safe     BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
)

follows (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id  UUID NOT NULL,
  following_id UUID NOT NULL,
  status       ENUM('pending','accepted','rejected') DEFAULT 'pending',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
)

trusted_circle (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  friend_id  UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
)

qr_codes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE,
  code       VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

bookmarks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  post_id    UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
)

drink_preferences (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  drink_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

---

## venue-service

```sql
venues (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(100) NOT NULL,
  slug              VARCHAR(100) UNIQUE NOT NULL,
  description       TEXT,
  category          VARCHAR(50),
  vibe_tags         TEXT[],
  genre_tags        TEXT[],
  address           TEXT,
  area              VARCHAR(50),
  lat               DECIMAL(9,6),
  lng               DECIMAL(9,6),
  phone             VARCHAR(20),
  website_url       TEXT,
  instagram_handle  VARCHAR(60),
  instagram_url     TEXT,
  bar_closes_at     TIME,
  kitchen_closes_at TIME,
  price_range       SMALLINT CHECK (price_range BETWEEN 1 AND 4),
  crowd_capacity    INTEGER,
  google_rating     DECIMAL(2,1),
  cover_photo_url   TEXT,
  status            ENUM('active','inactive') DEFAULT 'active',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
)

venue_photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id     UUID NOT NULL REFERENCES venues(id),
  url          TEXT NOT NULL,
  source       ENUM('instagram','google','admin') DEFAULT 'instagram',
  caption      TEXT,
  post_date    DATE,
  display_order SMALLINT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
)

venue_hours (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id   UUID NOT NULL REFERENCES venues(id),
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  opens_at   TIME,
  closes_at  TIME,
  is_closed  BOOLEAN DEFAULT FALSE
)

venue_reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id         UUID NOT NULL REFERENCES venues(id),
  user_id          UUID,
  source           ENUM('barblink','google') DEFAULT 'barblink',
  overall_rating   DECIMAL(2,1),
  drinks_rating    DECIMAL(2,1),
  food_rating      DECIMAL(2,1),
  music_rating     DECIMAL(2,1),
  atmosphere_rating DECIMAL(2,1),
  sound_rating     DECIMAL(2,1),
  service_rating   DECIMAL(2,1),
  body             TEXT,
  emoji_reaction   ENUM('fire','meh','thumbsdown'),
  created_at       TIMESTAMPTZ DEFAULT NOW()
)

scraper_sync_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id     UUID NOT NULL REFERENCES venues(id),
  source       ENUM('instagram','google'),
  status       ENUM('success','failed','blocked'),
  error_msg    TEXT,
  items_synced INTEGER DEFAULT 0,
  synced_at    TIMESTAMPTZ DEFAULT NOW()
)
```

---

## checkin-service

```sql
checkins (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL,
  venue_id     UUID NOT NULL,
  group_id     UUID,
  lat          DECIMAL(9,6),
  lng          DECIMAL(9,6),
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  checked_out_at TIMESTAMPTZ,
  is_active    BOOLEAN DEFAULT TRUE
)

group_checkins (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id     UUID NOT NULL,
  creator_id   UUID NOT NULL,
  name         VARCHAR(60),
  created_at   TIMESTAMPTZ DEFAULT NOW()
)

group_checkin_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID NOT NULL REFERENCES group_checkins(id),
  user_id     UUID NOT NULL,
  joined_at   TIMESTAMPTZ DEFAULT NOW()
)
```

---

## social-service

```sql
posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL,
  venue_id     UUID,
  type         ENUM('photo','video','drink_rating','poll','night_recap','repost') NOT NULL,
  caption      TEXT,
  media_urls   TEXT[],
  drink_name   VARCHAR(100),
  drink_rating SMALLINT CHECK (drink_rating BETWEEN 1 AND 5),
  original_post_id UUID,
  poll_options JSONB,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
)

post_tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES posts(id),
  user_id    UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

stories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID,
  venue_id    UUID,
  media_url   TEXT NOT NULL,
  media_type  ENUM('photo','video') NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
)

story_views (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id   UUID NOT NULL REFERENCES stories(id),
  viewer_id  UUID NOT NULL,
  viewed_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
)

likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  post_id    UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
)

checkin_reactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  checkin_id  UUID NOT NULL,
  emoji       VARCHAR(10) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, checkin_id)
)

comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES posts(id),
  user_id    UUID NOT NULL,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

poll_votes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES posts(id),
  user_id    UUID NOT NULL,
  option_idx SMALLINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
)
```

---

## dj-service

```sql
dj_profiles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(100) NOT NULL,
  type           ENUM('dj','live_band') NOT NULL,
  genre_tags     TEXT[],
  bio            TEXT,
  avatar_url     TEXT,
  instagram_url  TEXT,
  source         ENUM('auto','claimed') DEFAULT 'auto',
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
)

dj_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dj_id        UUID NOT NULL REFERENCES dj_profiles(id),
  venue_id     UUID NOT NULL,
  event_name   VARCHAR(200),
  event_date   DATE NOT NULL,
  start_time   TIME,
  end_time     TIME,
  source_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
)

dj_follows (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  dj_id      UUID NOT NULL REFERENCES dj_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, dj_id)
)

dj_ratings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dj_id          UUID NOT NULL REFERENCES dj_profiles(id),
  user_id        UUID NOT NULL,
  checkin_id     UUID NOT NULL,
  vibe_rating    SMALLINT CHECK (vibe_rating BETWEEN 1 AND 5),
  music_rating   SMALLINT CHECK (music_rating BETWEEN 1 AND 5),
  energy_rating  SMALLINT CHECK (energy_rating BETWEEN 1 AND 5),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dj_id, user_id, checkin_id)
)

setlists (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dj_id      UUID NOT NULL REFERENCES dj_profiles(id),
  event_id   UUID NOT NULL REFERENCES dj_events(id),
  user_id    UUID NOT NULL,
  songs      TEXT[],
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

---

## events-service

```sql
events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id     UUID NOT NULL,
  dj_id        UUID,
  title        VARCHAR(200) NOT NULL,
  description  TEXT,
  event_date   DATE NOT NULL,
  doors_open   TIME,
  ends_at      TIME,
  ticket_url   TEXT,
  cover_url    TEXT,
  source       ENUM('instagram_scrape','admin') DEFAULT 'instagram_scrape',
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
)

event_rsvps (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES events(id),
  user_id    UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
)
```

---

## community-service

```sql
streaks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL UNIQUE,
  current_streak   INTEGER DEFAULT 0,
  longest_streak   INTEGER DEFAULT 0,
  last_checkin_date DATE,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
)

badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  type        VARCHAR(50) NOT NULL,
  venue_id    UUID,
  earned_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type, venue_id)
)

venue_collections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  title       VARCHAR(100) NOT NULL,
  description TEXT,
  is_public   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
)

venue_collection_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES venue_collections(id),
  venue_id      UUID NOT NULL,
  added_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, venue_id)
)

weekly_leaderboard (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL,
  week_start    DATE NOT NULL,
  checkin_count INTEGER DEFAULT 0,
  post_count    INTEGER DEFAULT 0,
  score         INTEGER DEFAULT 0,
  area          VARCHAR(50),
  rank          INTEGER,
  UNIQUE(user_id, week_start)
)

neighbourhood_groups (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(60) NOT NULL,
  area       VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

---

## chat-service

```sql
conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type       ENUM('dm','group') NOT NULL,
  name       VARCHAR(60),
  created_at TIMESTAMPTZ DEFAULT NOW()
)

conversation_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  user_id         UUID NOT NULL,
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
)

messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender_id       UUID NOT NULL,
  body            TEXT,
  media_url       TEXT,
  shared_post_id  UUID,
  shared_venue_id UUID,
  created_at      TIMESTAMPTZ DEFAULT NOW()
)

message_reactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id),
  user_id    UUID NOT NULL,
  emoji      VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
)
```

---

## notification-service

```sql
notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  type       VARCHAR(50) NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  data       JSONB,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

waitlist_emails (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(254) UNIQUE NOT NULL,
  source     VARCHAR(50) DEFAULT 'landing_page',
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```
