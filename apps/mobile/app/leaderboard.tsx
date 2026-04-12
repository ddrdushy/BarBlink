import { useEffect, useState, useCallback } from 'react';
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
import { Screen } from '@/components/Screen';
import { colors, radii, spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { communityGet } from '@/lib/api';

type Period = 'week' | 'all';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  streakDays: number;
  score: number;
}

interface LeaderboardResponse {
  items: LeaderboardEntry[];
}

const MEDALS: Record<number, string> = {
  1: '\u{1F947}', // gold
  2: '\u{1F948}', // silver
  3: '\u{1F949}', // bronze
};

export default function Leaderboard() {
  const router = useRouter();
  const { token } = useAuth();
  const [period, setPeriod] = useState<Period>('week');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    if (!token) return;
    try {
      const data = await communityGet<LeaderboardResponse>(
        `/community/leaderboard?period=${period}`,
        token,
      );
      setEntries(data.items ?? (data as unknown as LeaderboardEntry[]));
    } catch {
      // silent
    }
  }, [token, period]);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard().finally(() => setLoading(false));
  }, [fetchLeaderboard]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  }, [fetchLeaderboard]);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>{'<'}</Text>
        </Pressable>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, period === 'week' && styles.tabActive]}
          onPress={() => setPeriod('week')}
        >
          <Text
            style={[
              styles.tabText,
              period === 'week' && styles.tabTextActive,
            ]}
          >
            This Week
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, period === 'all' && styles.tabActive]}
          onPress={() => setPeriod('all')}
        >
          <Text
            style={[
              styles.tabText,
              period === 'all' && styles.tabTextActive,
            ]}
          >
            All Time
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.neon} size="large" />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.neon}
            />
          }
          ListHeaderComponent={
            <View style={styles.tableHeader}>
              <Text style={[styles.thText, { width: 50 }]}>Rank</Text>
              <Text style={[styles.thText, { flex: 1 }]}>User</Text>
              <Text style={[styles.thText, { width: 60, textAlign: 'right' }]}>
                Streak
              </Text>
              <Text style={[styles.thText, { width: 60, textAlign: 'right' }]}>
                Score
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No entries yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ width: 50, alignItems: 'center' }}>
                {MEDALS[item.rank] ? (
                  <Text style={styles.medal}>{MEDALS[item.rank]}</Text>
                ) : (
                  <Text style={styles.rankNum}>{item.rank}</Text>
                )}
              </View>
              <Text style={[styles.cellText, { flex: 1 }]} numberOfLines={1}>
                @{item.username}
              </Text>
              <Text
                style={[styles.cellText, { width: 60, textAlign: 'right' }]}
              >
                {item.streakDays}d
              </Text>
              <Text
                style={[
                  styles.scoreText,
                  { width: 60, textAlign: 'right' },
                ]}
              >
                {item.score}
              </Text>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  backBtn: { color: colors.neonBright, fontSize: 24, fontWeight: '700' },
  title: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.neonGhost,
  },
  tabText: {
    color: colors.inkMute,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.neonBright,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  thText: {
    color: colors.inkFaint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  medal: { fontSize: 20 },
  rankNum: { color: colors.inkMute, fontSize: 16, fontWeight: '800' },
  cellText: { color: colors.ink, fontSize: 14, fontWeight: '500' },
  scoreText: { color: colors.neonBright, fontSize: 14, fontWeight: '800' },
  emptyText: { color: colors.inkMute, fontSize: 14 },
});
