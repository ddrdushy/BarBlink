import { useEffect, useState, useCallback } from 'react';
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
import { Screen } from '@/components/Screen';
import { colors, radii, spacing, touchTarget } from '@/constants/theme';
import { djGet } from '@/lib/api';

interface TrendingDj {
  id: string;
  name: string;
  slug: string;
  type: string;
  avatarUrl: string | null;
  genreTags: string[];
  country: string;
  ratingCount: number;
  rank: number;
}

const TYPE_FILTERS = ['All', 'dj', 'band'] as const;

const TYPE_LABELS: Record<string, string> = {
  All: 'All',
  dj: 'DJs',
  band: 'Bands',
};

const GENRE_TAGS = ['house', 'techno', 'hip-hop', 'r&b', 'pop', 'latin', 'afrobeats', 'drum-n-bass'] as const;

const RANK_BADGE = ['', '\u{1F947}', '\u{1F948}', '\u{1F949}']; // gold, silver, bronze

export default function TrendingScreen() {
  const router = useRouter();
  const [djs, setDjs] = useState<TrendingDj[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [genreFilter, setGenreFilter] = useState<string | null>(null);

  const fetchTrending = useCallback(async (type: string, genre: string | null) => {
    try {
      const params = new URLSearchParams();
      if (type !== 'All') params.set('type', type);
      if (genre) params.set('genre', genre);
      const qs = params.toString();
      const data = await djGet<TrendingDj[]>(`/dj/trending${qs ? `?${qs}` : ''}`);
      setDjs(data);
    } catch {
      setDjs([]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTrending(typeFilter, genreFilter).finally(() => setLoading(false));
  }, [typeFilter, genreFilter, fetchTrending]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTrending(typeFilter, genreFilter);
    setRefreshing(false);
  };

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backBtn}>{'<'} Back</Text>
        </Pressable>
        <Text style={styles.title}>Who's Hot This Week 🔥</Text>
        <View style={{ width: 60 }} />
      </View>

      <Text style={styles.subtitle}>Ranked by crowd turnout</Text>

      {/* Type filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {TYPE_FILTERS.map((f) => (
          <Pressable
            key={f}
            style={[styles.chip, typeFilter === f && styles.chipActive]}
            onPress={() => setTypeFilter(f)}
          >
            <Text style={[styles.chipText, typeFilter === f && styles.chipTextActive]}>
              {TYPE_LABELS[f]}
            </Text>
          </Pressable>
        ))}
        <View style={styles.chipDivider} />
        {GENRE_TAGS.map((g) => (
          <Pressable
            key={g}
            style={[styles.chip, genreFilter === g && styles.chipActive]}
            onPress={() => setGenreFilter(genreFilter === g ? null : g)}
          >
            <Text style={[styles.chipText, genreFilter === g && styles.chipTextActive]}>
              {g}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.neon} size="large" />
        </View>
      ) : djs.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🎧</Text>
          <Text style={styles.emptyTitle}>No trending DJs yet</Text>
          <Text style={styles.emptySub}>Rate your favourite DJs to help them trend</Text>
        </View>
      ) : (
        <FlatList
          data={djs}
          keyExtractor={(d) => d.id}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.neon} />
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/dj/${item.id}`)}
            >
              <View style={styles.cardContent}>
                {/* Rank badge */}
                <View style={[
                  styles.rankBadge,
                  item.rank <= 3 && styles.rankBadgeTop,
                ]}>
                  {item.rank <= 3 ? (
                    <Text style={styles.rankMedal}>{RANK_BADGE[item.rank]}</Text>
                  ) : (
                    <Text style={styles.rankNumber}>{item.rank}</Text>
                  )}
                </View>

                {/* Avatar */}
                <View style={styles.avatar}>
                  <Text style={{ fontSize: 20 }}>
                    {item.type === 'band' ? '🎸' : '🎧'}
                  </Text>
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <View style={styles.genreRow}>
                    {item.genreTags.slice(0, 3).map((g) => (
                      <View key={g} style={styles.genrePill}>
                        <Text style={styles.genrePillText}>{g}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Follow button */}
                <Pressable style={styles.followBtn}>
                  <Text style={styles.followBtnText}>Follow</Text>
                </Pressable>
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn: { color: colors.neonBright, fontSize: 15, fontWeight: '600' },
  title: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  subtitle: {
    color: colors.inkMute,
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  chips: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    minHeight: touchTarget,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.neonGhost,
    borderColor: colors.neonBorder,
  },
  chipText: { color: colors.inkMute, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.neonBright },
  chipDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 4,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  emptySub: { color: colors.inkMute, fontSize: 14 },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: touchTarget,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeTop: {
    backgroundColor: 'rgba(255,214,10,0.15)',
  },
  rankMedal: { fontSize: 18 },
  rankNumber: { color: colors.inkMute, fontSize: 14, fontWeight: '700' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  genreRow: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  genrePill: {
    backgroundColor: colors.bgElevated,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  genrePillText: { color: colors.inkFaint, fontSize: 11, fontWeight: '600' },
  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.neonGhost,
    borderWidth: 1,
    borderColor: colors.neonBorder,
  },
  followBtnText: {
    color: colors.neonBright,
    fontSize: 13,
    fontWeight: '700',
  },
});
