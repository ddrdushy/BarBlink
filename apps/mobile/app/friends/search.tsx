import { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { colors, radii, spacing, touchTarget } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { userGet, userPost } from '@/lib/api';

interface SearchUser {
  id: string;
  username: string;
  displayName: string | null;
  country: string;
  avatarUrl: string | null;
}

interface SearchResponse {
  items: SearchUser[];
  total: number;
}

const COUNTRY_FLAGS: Record<string, string> = {
  MY: '\u{1F1F2}\u{1F1FE}',
  LK: '\u{1F1F1}\u{1F1F0}',
  SG: '\u{1F1F8}\u{1F1EC}',
  TH: '\u{1F1F9}\u{1F1ED}',
  ID: '\u{1F1EE}\u{1F1E9}',
  PH: '\u{1F1F5}\u{1F1ED}',
  VN: '\u{1F1FB}\u{1F1F3}',
  IN: '\u{1F1EE}\u{1F1F3}',
};

export default function FriendSearchScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const doSearch = useCallback(async (q: string) => {
    if (!token || q.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await userGet<SearchResponse>(`/users/search?q=${encodeURIComponent(q.trim())}`, token);
      setResults(data.items || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleFollow = async (userId: string) => {
    if (!token) return;
    setFollowingIds((prev) => new Set(prev).add(userId));
    try {
      await userPost(`/users/${userId}/follow`, {}, token);
      setFollowedIds((prev) => new Set(prev).add(userId));
    } catch {
      // If error, revert optimistic state
    } finally {
      setFollowingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const getFollowLabel = (userId: string): string => {
    if (followedIds.has(userId)) return 'Requested';
    if (followingIds.has(userId)) return '...';
    return 'Follow';
  };

  const isFollowDisabled = (userId: string): boolean => {
    return followedIds.has(userId) || followingIds.has(userId);
  };

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backBtn}>{'<'} Back</Text>
        </Pressable>
        <Text style={styles.title}>Find Friends</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => doSearch(query)}
          placeholder="Search by username..."
          placeholderTextColor={colors.inkFaint}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        <Pressable
          style={[styles.searchBtn, query.trim().length < 2 && styles.searchBtnDisabled]}
          onPress={() => doSearch(query)}
          disabled={query.trim().length < 2}
        >
          <Text style={styles.searchBtnText}>Search</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.neon} size="large" />
        </View>
      ) : !searched ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>👥</Text>
          <Text style={styles.emptyTitle}>Find your crew</Text>
          <Text style={styles.emptySub}>Search by username to follow friends</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>No users found</Text>
          <Text style={styles.emptySub}>Try a different username</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => {
            const flag = COUNTRY_FLAGS[item.country] || '';
            return (
              <View style={styles.userRow}>
                <View style={styles.userAvatar}>
                  <Text style={{ fontSize: 18 }}>🦉</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.username}>@{item.username}</Text>
                  <Text style={styles.userMeta}>
                    {item.displayName ?? ''} {flag}
                  </Text>
                </View>
                <Pressable
                  style={[
                    styles.followBtn,
                    followedIds.has(item.id) && styles.followBtnDone,
                  ]}
                  onPress={() => handleFollow(item.id)}
                  disabled={isFollowDisabled(item.id)}
                >
                  <Text
                    style={[
                      styles.followBtnText,
                      followedIds.has(item.id) && styles.followBtnTextDone,
                    ]}
                  >
                    {getFollowLabel(item.id)}
                  </Text>
                </Pressable>
              </View>
            );
          }}
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
    paddingBottom: spacing.md,
  },
  backBtn: { color: colors.neonBright, fontSize: 15, fontWeight: '600' },
  title: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: 10,
    marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1,
    height: touchTarget,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: spacing.lg,
    color: colors.ink,
    fontSize: 15,
  },
  searchBtn: {
    height: touchTarget,
    paddingHorizontal: 18,
    backgroundColor: colors.neonGhost,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.neonBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnDisabled: {
    opacity: 0.4,
  },
  searchBtnText: {
    color: colors.neonBright,
    fontSize: 14,
    fontWeight: '700',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  emptySub: { color: colors.inkMute, fontSize: 14 },
  sep: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 12,
    minHeight: touchTarget,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  userMeta: { color: colors.inkMute, fontSize: 12, marginTop: 2 },
  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.neonGhost,
    borderWidth: 1,
    borderColor: colors.neonBorder,
  },
  followBtnDone: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  followBtnText: {
    color: colors.neonBright,
    fontSize: 13,
    fontWeight: '700',
  },
  followBtnTextDone: {
    color: colors.inkMute,
  },
});
