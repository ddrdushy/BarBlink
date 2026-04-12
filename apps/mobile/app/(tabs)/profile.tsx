import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { NeonButton } from '@/components/NeonButton';
import { colors, radii, spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { userGet, checkinGet, communityGet } from '@/lib/api';

interface FollowCounts { followers: number; following: number }

interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  country: string;
  drinkPrefs: string[];
  createdAt: string;
}

interface Badge {
  e: string;
  t: string;
  s: string;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

interface CheckinCountData {
  count: number;
}

interface RecentCheckin {
  id: string;
  venueId: string;
  venueName?: string;
  checkedInAt: string;
}

interface RecentCheckinsResponse {
  items: RecentCheckin[];
  uniqueVenues: number;
}

const COUNTRY_FLAGS: Record<string, string> = {
  MY: '\u{1F1F2}\u{1F1FE}',
  LK: '\u{1F1F1}\u{1F1F0}',
};

const DEFAULT_BADGES: Badge[] = [
  { e: '🦉', t: 'Night Owl', s: '7-night streak' },
  { e: '🗺️', t: 'Explorer', s: '0 venues' },
  { e: '🥂', t: 'Curator', s: '0 collections' },
];

export default function Profile() {
  const router = useRouter();
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [counts, setCounts] = useState<FollowCounts>({ followers: 0, following: 0 });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [checkinCount, setCheckinCount] = useState<number>(0);
  const [recentCheckins, setRecentCheckins] = useState<RecentCheckin[]>([]);
  const [uniqueVenues, setUniqueVenues] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      userGet<UserProfile>('/users/me', token).then(setProfile),
      userGet<FollowCounts>('/users/me/counts', token).then(setCounts).catch(() => {}),
      // Fetch badges from community service
      communityGet<Badge[]>('/community/badges/me', token)
        .then((data) => {
          if (data && Array.isArray(data) && data.length > 0) {
            setBadges(data);
          }
        })
        .catch(() => {}),
      // Fetch streak from community service
      communityGet<StreakData>('/community/streaks/me', token)
        .then((data) => {
          if (data && typeof data.currentStreak === 'number') {
            setStreak(data.currentStreak);
          }
        })
        .catch(() => {}),
      // Fetch check-in count
      checkinGet<CheckinCountData>('/checkins/me/count', token)
        .then((data) => {
          if (data && typeof data.count === 'number') {
            setCheckinCount(data.count);
          }
        })
        .catch(() => {}),
      // Fetch recent check-ins for passport
      checkinGet<RecentCheckinsResponse>('/checkins/me/recent', token)
        .then((data) => {
          if (data && Array.isArray(data.items)) {
            setRecentCheckins(data.items.slice(0, 10));
            setUniqueVenues(data.uniqueVenues ?? 0);
          }
        })
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [token]);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/welcome');
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.neon} size="large" />
        </View>
      </Screen>
    );
  }

  const flag = COUNTRY_FLAGS[profile?.country || 'MY'] || '';
  const displayBadges = badges.length > 0 ? badges : DEFAULT_BADGES;
  const hasBadgesFromApi = badges.length > 0;

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 140 }}>
        <View style={styles.head}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 40 }}>🦉</Text>
          </View>
          <Text style={styles.name}>@{profile?.username ?? 'unknown'}</Text>
          <Text style={styles.bio}>
            {profile?.displayName ?? ''} {flag ? `  ${flag}` : ''}
          </Text>
          {profile?.bio ? <Text style={styles.bioText}>{profile.bio}</Text> : null}
        </View>

        <View style={styles.stats}>
          {[
            { k: String(counts.followers), v: 'Followers' },
            { k: String(counts.following), v: 'Following' },
            { k: String(checkinCount), v: 'Check-ins' },
          ].map((s) => (
            <View key={s.v} style={styles.statCell}>
              <Text style={styles.statK}>{s.k}</Text>
              <Text style={styles.statV}>{s.v}</Text>
            </View>
          ))}
        </View>

        {checkinCount === 0 && (
          <View style={styles.checkinHint}>
            <Text style={styles.checkinHintText}>Check in to start counting!</Text>
          </View>
        )}

        {/* Find Friends */}
        <Pressable style={styles.findFriendsBtn} onPress={() => router.push('/friends/search')}>
          <Text style={styles.findFriendsIcon}>👥</Text>
          <Text style={styles.findFriendsText}>Find Friends</Text>
          <Text style={styles.findFriendsArrow}>›</Text>
        </Pressable>

        {/* My Scene */}
        <Pressable style={styles.findFriendsBtn} onPress={() => router.push('/neighbourhoods')}>
          <Text style={styles.findFriendsIcon}>🏙️</Text>
          <Text style={styles.findFriendsText}>My Scene</Text>
          <Text style={styles.findFriendsArrow}>›</Text>
        </Pressable>

        {/* Streak */}
        {streak > 0 && (
          <View style={styles.streakCard}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.streakTitle}>{streak}-night streak</Text>
              <Text style={styles.streakSub}>Keep it going!</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionLabel}>BADGES</Text>
        {!hasBadgesFromApi ? (
          <View style={styles.badgeRow}>
            {displayBadges.map((b) => (
              <View key={b.t} style={[styles.badgeCard, styles.badgeCardLocked]}>
                <Text style={styles.badgeEmoji}>{b.e}</Text>
                <Text style={styles.badgeTitle}>{b.t}</Text>
                <Text style={styles.badgeSub}>Locked</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.badgeRow}>
            {displayBadges.map((b) => (
              <View key={b.t} style={styles.badgeCard}>
                <Text style={styles.badgeEmoji}>{b.e}</Text>
                <Text style={styles.badgeTitle}>{b.t}</Text>
                <Text style={styles.badgeSub}>{b.s}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionLabel}>NIGHTLIFE PASSPORT</Text>
        {recentCheckins.length === 0 ? (
          <View style={styles.passportCard}>
            <Text style={styles.passportPlaceholder}>
              Your map unlocks after your first check-in
            </Text>
          </View>
        ) : (
          <View style={styles.passportCard}>
            <View style={styles.passportHeader}>
              <Text style={styles.passportCount}>{uniqueVenues}</Text>
              <Text style={styles.passportCountLabel}>Unique Venues</Text>
            </View>
            <View style={styles.passportDivider} />
            {recentCheckins.map((ci) => (
              <View key={ci.id} style={styles.passportRow}>
                <Text style={styles.passportPin}>{'*'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.passportVenue}>
                    {ci.venueName || ci.venueId.slice(0, 8)}
                  </Text>
                  <Text style={styles.passportDate}>
                    {new Date(ci.checkedInAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ marginTop: spacing.xxl }}>
          <NeonButton label="Log out" variant="ghost" onPress={handleLogout} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  head: { alignItems: 'center', gap: 8, marginBottom: spacing.xl },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.bgSurface,
    borderWidth: 2,
    borderColor: colors.neonBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: colors.ink, fontSize: 22, fontWeight: '800', letterSpacing: -0.6 },
  bio: { color: colors.inkMute, fontSize: 14 },
  bioText: { color: colors.inkMute, fontSize: 13, textAlign: 'center', maxWidth: 280, marginTop: 4 },
  stats: {
    flexDirection: 'row',
    backgroundColor: colors.bgSurface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  statCell: { flex: 1, alignItems: 'center', gap: 2 },
  statK: { color: colors.ink, fontSize: 24, fontWeight: '800' },
  statV: { color: colors.inkMute, fontSize: 11, letterSpacing: 0.6 },
  checkinHint: {
    backgroundColor: colors.neonGhost,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checkinHintText: {
    color: colors.neonBright,
    fontSize: 13,
    fontWeight: '600',
  },
  findFriendsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: 10,
  },
  findFriendsIcon: { fontSize: 20 },
  findFriendsText: { color: colors.ink, fontSize: 15, fontWeight: '700', flex: 1 },
  findFriendsArrow: { color: colors.inkMute, fontSize: 22, fontWeight: '300' },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,165,0,0.2)',
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: 12,
  },
  streakEmoji: { fontSize: 28 },
  streakTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  streakSub: { color: colors.inkMute, fontSize: 12, marginTop: 2 },
  sectionLabel: {
    color: colors.neonBright,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  badgeRow: { flexDirection: 'row', gap: 10, marginBottom: spacing.xl },
  badgeCard: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeEmoji: { fontSize: 22 },
  badgeTitle: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  badgeSub: { color: colors.inkMute, fontSize: 10 },
  passportCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: spacing.xl,
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'center',
  },
  passportPlaceholder: {
    color: colors.inkMute,
    fontSize: 13,
    textAlign: 'center',
  },
  passportHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  passportCount: {
    color: colors.neonBright,
    fontSize: 32,
    fontWeight: '800',
  },
  passportCountLabel: {
    color: colors.inkMute,
    fontSize: 11,
    letterSpacing: 0.8,
    marginTop: 2,
  },
  passportDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: spacing.md,
  },
  passportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: spacing.sm,
  },
  passportPin: {
    color: colors.neon,
    fontSize: 16,
    fontWeight: '700',
  },
  passportVenue: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  passportDate: {
    color: colors.inkFaint,
    fontSize: 11,
    marginTop: 1,
  },
});
