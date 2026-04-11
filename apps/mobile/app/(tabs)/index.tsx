import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { colors, radii, spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { socialGet, socialPost, socialDelete } from '@/lib/api';

interface FeedPost {
  id: string;
  userId: string;
  venueId: string | null;
  caption: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  isLikedByMe: boolean;
}

interface FeedResponse {
  items: FeedPost[];
  total: number;
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function FeedScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = useCallback(async () => {
    if (!token) return;
    try {
      const data = await socialGet<FeedResponse>('/feed', token);
      setPosts(data.items);
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => {
    fetchFeed().finally(() => setLoading(false));
  }, [fetchFeed]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeed();
    setRefreshing(false);
  };

  const toggleLike = async (post: FeedPost) => {
    if (!token) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, isLikedByMe: !p.isLikedByMe, likeCount: p.isLikedByMe ? p.likeCount - 1 : p.likeCount + 1 }
          : p,
      ),
    );
    try {
      if (post.isLikedByMe) {
        await socialDelete(`/posts/${post.id}/like`, token);
      } else {
        await socialPost(`/posts/${post.id}/like`, {}, token);
      }
    } catch {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, isLikedByMe: post.isLikedByMe, likeCount: post.likeCount } : p)),
      );
    }
  };

  const hero = posts[0];
  const rest = posts.slice(1);

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Text style={styles.appName}>
          blink<Text style={{ color: colors.neon }}>.</Text>feed
        </Text>
        <Pressable style={styles.fabSmall} onPress={() => router.push('/post/create')}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.neon} size="large" />
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🦉</Text>
          <Text style={styles.emptyTitle}>No posts yet</Text>
          <Text style={styles.emptySub}>Be the first to post something!</Text>
          <Pressable style={styles.emptyBtn} onPress={() => router.push('/post/create')}>
            <Text style={styles.emptyBtnText}>Create a post</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(p) => p.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.neon} />}
          contentContainerStyle={{ paddingBottom: 140 }}
          ListHeaderComponent={
            hero ? (
              <Pressable style={styles.heroCard} onPress={() => router.push(`/post/${hero.id}`)}>
                <LinearGradient colors={['#C45AFF', '#7A2BBE', '#1a1a20']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={StyleSheet.absoluteFill} />
                <View style={styles.heroMeta}>
                  <Text style={styles.heroCaption} numberOfLines={3}>{hero.caption || 'No caption'}</Text>
                  <Text style={styles.heroTime}>{timeAgo(hero.createdAt)}</Text>
                </View>
                <View style={styles.heroStats}>
                  <Pressable onPress={() => toggleLike(hero)}>
                    <Text style={styles.heroStat}>{hero.isLikedByMe ? '❤️' : '🤍'} {hero.likeCount}</Text>
                  </Pressable>
                  <Text style={styles.heroStat}>💬 {hero.commentCount}</Text>
                </View>
              </Pressable>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable style={styles.postCard} onPress={() => router.push(`/post/${item.id}`)}>
              <View style={styles.postTop}>
                <View style={styles.postAvatar}><Text style={{ fontSize: 14 }}>🦉</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.postCaption} numberOfLines={2}>{item.caption || 'No caption'}</Text>
                </View>
                <Text style={styles.postTime}>{timeAgo(item.createdAt)}</Text>
              </View>
              <View style={styles.postBottom}>
                <Pressable onPress={() => toggleLike(item)}>
                  <Text style={styles.postStat}>{item.isLikedByMe ? '❤️' : '🤍'} {item.likeCount}</Text>
                </Pressable>
                <Text style={styles.postStat}>💬 {item.commentCount}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md },
  appName: { color: colors.ink, fontSize: 24, fontWeight: '800', letterSpacing: -0.8 },
  fabSmall: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.neonGhost, borderWidth: 1, borderColor: colors.neonBorder, alignItems: 'center', justifyContent: 'center' },
  fabText: { color: colors.neonBright, fontSize: 20, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  emptySub: { color: colors.inkMute, fontSize: 14 },
  emptyBtn: { marginTop: 8, backgroundColor: colors.neonGhost, borderWidth: 1, borderColor: colors.neonBorder, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  emptyBtnText: { color: colors.neonBright, fontSize: 14, fontWeight: '700' },
  heroCard: { marginHorizontal: spacing.xl, height: 320, borderRadius: radii.xl, overflow: 'hidden', marginBottom: spacing.md, borderWidth: 1, borderColor: colors.neonBorder, justifyContent: 'flex-end' },
  heroMeta: { padding: 16, gap: 4 },
  heroCaption: { color: colors.ink, fontSize: 16, fontWeight: '600', lineHeight: 22 },
  heroTime: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
  heroStats: { position: 'absolute', right: 14, bottom: 16, gap: 10 },
  heroStat: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  postCard: { marginHorizontal: spacing.xl, backgroundColor: colors.bgSurface, borderRadius: radii.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: spacing.lg, marginBottom: spacing.sm },
  postTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  postAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  postCaption: { color: colors.ink, fontSize: 14, lineHeight: 20 },
  postTime: { color: colors.inkFaint, fontSize: 11 },
  postBottom: { flexDirection: 'row', gap: 16, marginTop: 10, paddingLeft: 42 },
  postStat: { color: colors.inkMute, fontSize: 12, fontWeight: '600' },
});
