import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { StoriesStrip } from '@/components/StoriesStrip';
import { CheckinCard } from '@/components/CheckinCard';
import { colors, radii, spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { socialGet, socialPost, socialDelete } from '@/lib/api';

/* ---------- Types ---------- */

interface StoryItem {
  userId: string;
  username?: string;
  avatarUrl?: string | null;
  hasUnviewed: boolean;
  storyCount: number;
  isCheckedIn?: boolean;
}

interface TonightFriend {
  userId: string;
  username: string;
  avatarUrl?: string | null;
  venueName: string;
}

interface CheckinItem {
  id: string;
  userId: string;
  username: string;
  venueName: string;
  crowdStatus: 'quiet' | 'lively' | 'packed';
}

interface FeedItemBase {
  id: string;
  type: 'hero_post' | 'post' | 'checkin_pair';
}

interface HeroPostItem extends FeedItemBase {
  type: 'hero_post';
  userId: string;
  username?: string;
  venueId: string | null;
  caption: string | null;
  mediaUrl?: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  isLikedByMe: boolean;
  postType?: string;
  drinkName?: string | null;
  drinkRating?: number | null;
}

interface PostItem extends FeedItemBase {
  type: 'post';
  userId: string;
  username?: string;
  venueId: string | null;
  caption: string | null;
  mediaUrl?: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  isLikedByMe: boolean;
  postType?: string;
  drinkName?: string | null;
  drinkRating?: number | null;
}

interface CheckinPairItem extends FeedItemBase {
  type: 'checkin_pair';
  checkins: [CheckinItem, CheckinItem];
}

type FeedItem = HeroPostItem | PostItem | CheckinPairItem;

interface EnrichedFeedResponse {
  stories: StoryItem[];
  tonightStrip: TonightFriend[];
  items: FeedItem[];
}

interface LegacyFeedResponse {
  items: Array<{
    id: string;
    userId: string;
    venueId: string | null;
    caption: string | null;
    createdAt: string;
    likeCount: number;
    commentCount: number;
    isLikedByMe: boolean;
  }>;
  total: number;
}

/* ---------- Helpers ---------- */

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

/** Convert legacy feed items into enriched-style feed items */
function legacyToEnriched(legacy: LegacyFeedResponse): EnrichedFeedResponse {
  const items: FeedItem[] = [];
  if (legacy.items.length > 0) {
    const first = legacy.items[0];
    items.push({ ...first, type: 'hero_post' } as HeroPostItem);
    for (let i = 1; i < legacy.items.length; i++) {
      items.push({ ...legacy.items[i], type: 'post' } as PostItem);
    }
  }
  return { stories: [], tonightStrip: [], items };
}

/* ---------- Component ---------- */

export default function FeedScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [feed, setFeed] = useState<EnrichedFeedResponse>({
    stories: [],
    tonightStrip: [],
    items: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  const fetchFeed = useCallback(async () => {
    if (!token) return;
    try {
      // Try enriched endpoint first
      const data = await socialGet<EnrichedFeedResponse>('/feed/enriched', token);
      setFeed(data);
    } catch {
      // Fallback to legacy endpoint
      try {
        const legacy = await socialGet<LegacyFeedResponse>('/feed', token);
        setFeed(legacyToEnriched(legacy));
      } catch {
        /* silent */
      }
    }
  }, [token]);

  useEffect(() => {
    fetchFeed().finally(() => setLoading(false));
  }, [fetchFeed]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeed();
    setRefreshing(false);
  };

  /* --- Like toggle (works on hero_post and post types) --- */
  const toggleLike = async (itemId: string) => {
    if (!token) return;
    setFeed((prev) => ({
      ...prev,
      items: prev.items.map((fi) => {
        if (fi.id !== itemId) return fi;
        if (fi.type === 'hero_post' || fi.type === 'post') {
          return {
            ...fi,
            isLikedByMe: !fi.isLikedByMe,
            likeCount: fi.isLikedByMe ? fi.likeCount - 1 : fi.likeCount + 1,
          };
        }
        return fi;
      }),
    }));

    const item = feed.items.find((fi) => fi.id === itemId);
    if (!item || (item.type !== 'hero_post' && item.type !== 'post')) return;

    try {
      if (item.isLikedByMe) {
        await socialDelete(`/posts/${itemId}/like`, token);
      } else {
        await socialPost(`/posts/${itemId}/like`, {}, token);
      }
    } catch {
      // revert
      setFeed((prev) => ({
        ...prev,
        items: prev.items.map((fi) => (fi.id === itemId ? item : fi)),
      }));
    }
  };

  const handleCheckinReact = async (checkinId: string, emoji: string) => {
    if (!token) return;
    try {
      await socialPost(`/checkins/${checkinId}/react`, { emoji }, token);
    } catch {
      /* silent */
    }
  };

  /* --- Bookmark toggle --- */
  const toggleBookmark = async (itemId: string) => {
    if (!token) return;
    const was = bookmarked.has(itemId);
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (was) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
    try {
      if (was) {
        await socialDelete(`/posts/${itemId}/bookmark`, token);
      } else {
        await socialPost(`/posts/${itemId}/bookmark`, {}, token);
      }
    } catch {
      // revert
      setBookmarked((prev) => {
        const next = new Set(prev);
        if (was) next.add(itemId);
        else next.delete(itemId);
        return next;
      });
    }
  };

  /* --- Render helpers --- */

  const renderHeroPost = (item: HeroPostItem) => (
    <Pressable style={styles.heroCard} onPress={() => router.push(`/post/${item.id}`)}>
      <LinearGradient
        colors={['#C45AFF', '#7A2BBE', '#1a1a20']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={StyleSheet.absoluteFill} />
      <View style={styles.heroMeta}>
        <Text style={styles.heroCaption} numberOfLines={3}>
          {item.caption || 'No caption'}
        </Text>
        <Text style={styles.heroTime}>{timeAgo(item.createdAt)}</Text>
      </View>
      <View style={styles.heroStats}>
        <Pressable onPress={() => toggleLike(item.id)}>
          <Text style={styles.heroStat}>
            {item.isLikedByMe ? '\u2764\uFE0F' : '\uD83E\uDD0D'} {item.likeCount}
          </Text>
        </Pressable>
        <Text style={styles.heroStat}>{'\uD83D\uDCAC'} {item.commentCount}</Text>
        <Pressable onPress={() => toggleBookmark(item.id)}>
          <Text style={styles.heroStat}>
            {bookmarked.has(item.id) ? '\uD83D\uDD16' : '\uD83D\uDCC4'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );

  const renderPost = (item: PostItem) => (
    <Pressable style={styles.postCard} onPress={() => router.push(`/post/${item.id}`)}>
      <View style={styles.postTop}>
        <View style={styles.postAvatar}>
          <Text style={{ fontSize: 14 }}>{'\uD83E\uDD89'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          {item.username ? (
            <Text style={styles.postUsername}>{item.username}</Text>
          ) : null}
          <Text style={styles.postCaption} numberOfLines={2}>
            {item.caption || 'No caption'}
          </Text>
        </View>
        <Text style={styles.postTime}>{timeAgo(item.createdAt)}</Text>
      </View>
      <View style={styles.postBottom}>
        <Pressable onPress={() => toggleLike(item.id)}>
          <Text style={styles.postStat}>
            {item.isLikedByMe ? '\u2764\uFE0F' : '\uD83E\uDD0D'} {item.likeCount}
          </Text>
        </Pressable>
        <Text style={styles.postStat}>{'\uD83D\uDCAC'} {item.commentCount}</Text>
        <Pressable onPress={() => toggleBookmark(item.id)}>
          <Text style={styles.postStat}>
            {bookmarked.has(item.id) ? '\uD83D\uDD16' : '\uD83D\uDCC4'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );

  const renderCheckinPair = (item: CheckinPairItem) => (
    <View style={styles.checkinPairRow}>
      {item.checkins.map((c) => (
        <CheckinCard key={c.id} checkin={c} onReact={handleCheckinReact} />
      ))}
    </View>
  );

  const renderFeedItem = ({ item }: { item: FeedItem }) => {
    switch (item.type) {
      case 'hero_post':
        return renderHeroPost(item);
      case 'post':
        return renderPost(item);
      case 'checkin_pair':
        return renderCheckinPair(item);
      default:
        return null;
    }
  };

  /* --- Tonight strip --- */
  const renderTonightStrip = () => {
    if (feed.tonightStrip.length === 0) return null;
    return (
      <View style={styles.tonightContainer}>
        <View style={styles.tonightHeader}>
          <View style={styles.liveDot} />
          <Text style={styles.tonightText}>
            {feed.tonightStrip.length} friend{feed.tonightStrip.length !== 1 ? 's' : ''} out tonight
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tonightScroll}
        >
          {feed.tonightStrip.map((f) => (
            <View key={f.userId} style={styles.tonightItem}>
              <View style={styles.tonightAvatar}>
                <Text style={{ fontSize: 12 }}>{'\uD83E\uDD89'}</Text>
              </View>
              <Text style={styles.tonightVenue} numberOfLines={1}>
                {f.venueName}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  /* --- Header section for FlatList --- */
  const renderListHeader = () => (
    <View>
      {/* Stories */}
      {feed.stories.length > 0 || true /* always show "You" button */ ? (
        <StoriesStrip
          stories={feed.stories}
          onCreateStory={() => router.push('/story/create')}
        />
      ) : null}

      {/* Tonight strip */}
      {renderTonightStrip()}
    </View>
  );

  /* --- Main render --- */
  return (
    <Screen padded={false}>
      {/* Header bar */}
      <View style={styles.header}>
        <Text style={styles.appName}>
          blink<Text style={{ color: colors.neon }}>.</Text>feed
        </Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.fabSmall} onPress={() => router.push('/notifications')}>
            <Text style={styles.bellText}>{'\uD83D\uDD14'}</Text>
          </Pressable>
          <Pressable style={styles.fabSmall} onPress={() => router.push('/post/create')}>
            <Text style={styles.fabText}>+</Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.neon} size="large" />
        </View>
      ) : feed.items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>{'\uD83E\uDD89'}</Text>
          <Text style={styles.emptyTitle}>No posts yet</Text>
          <Text style={styles.emptySub}>Be the first to post something!</Text>
          <Pressable style={styles.emptyBtn} onPress={() => router.push('/post/create')}>
            <Text style={styles.emptyBtnText}>Create a post</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={feed.items}
          keyExtractor={(item) => item.id}
          renderItem={renderFeedItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.neon} />
          }
          contentContainerStyle={{ paddingBottom: 140 }}
          ListHeaderComponent={renderListHeader}
        />
      )}
    </Screen>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  appName: { color: colors.ink, fontSize: 24, fontWeight: '800', letterSpacing: -0.8 },
  headerActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  fabSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.neonGhost,
    borderWidth: 1,
    borderColor: colors.neonBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: colors.neonBright, fontSize: 20, fontWeight: '700' },
  bellText: { fontSize: 18 },

  /* Center / empty */
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  emptySub: { color: colors.inkMute, fontSize: 14 },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: colors.neonGhost,
    borderWidth: 1,
    borderColor: colors.neonBorder,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyBtnText: { color: colors.neonBright, fontSize: 14, fontWeight: '700' },

  /* Tonight strip */
  tonightContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: 8,
  },
  tonightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.live,
  },
  tonightText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  tonightScroll: {
    gap: 12,
  },
  tonightItem: {
    alignItems: 'center',
    gap: 4,
    width: 56,
  },
  tonightAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.live,
  },
  tonightVenue: {
    color: colors.inkMute,
    fontSize: 10,
    textAlign: 'center',
    width: 56,
  },

  /* Hero post */
  heroCard: {
    marginHorizontal: spacing.xl,
    height: 320,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neonBorder,
    justifyContent: 'flex-end',
  },
  heroMeta: { padding: 16, gap: 4 },
  heroCaption: { color: colors.ink, fontSize: 16, fontWeight: '600', lineHeight: 22 },
  heroTime: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
  heroStats: { position: 'absolute', right: 14, bottom: 16, gap: 10 },
  heroStat: { color: colors.ink, fontSize: 13, fontWeight: '600' },

  /* Regular post */
  postCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  postTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  postAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postUsername: { color: colors.ink, fontSize: 13, fontWeight: '700', marginBottom: 2 },
  postCaption: { color: colors.ink, fontSize: 14, lineHeight: 20 },
  postTime: { color: colors.inkFaint, fontSize: 11 },
  postBottom: { flexDirection: 'row', gap: 16, marginTop: 10, paddingLeft: 42 },
  postStat: { color: colors.inkMute, fontSize: 12, fontWeight: '600' },

  /* Checkin pair row */
  checkinPairRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
});
