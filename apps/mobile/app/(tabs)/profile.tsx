import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { NeonButton } from '@/components/NeonButton';
import { colors, radii, spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { userGet } from '@/lib/api';

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

const COUNTRY_FLAGS: Record<string, string> = {
  MY: '\u{1F1F2}\u{1F1FE}',
  LK: '\u{1F1F1}\u{1F1F0}',
};

const badges = [
  { e: '🦉', t: 'Night Owl', s: '7-night streak' },
  { e: '🗺️', t: 'Explorer', s: '0 venues' },
  { e: '🥂', t: 'Curator', s: '0 collections' },
];

export default function Profile() {
  const router = useRouter();
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    userGet<UserProfile>('/users/me', token)
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
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
            { k: '0', v: 'Venues' },
            { k: '0', v: 'Check-ins' },
            { k: '0', v: 'Night streak' },
          ].map((s) => (
            <View key={s.v} style={styles.statCell}>
              <Text style={styles.statK}>{s.k}</Text>
              <Text style={styles.statV}>{s.v}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>BADGES</Text>
        <View style={styles.badgeRow}>
          {badges.map((b) => (
            <View key={b.t} style={styles.badgeCard}>
              <Text style={styles.badgeEmoji}>{b.e}</Text>
              <Text style={styles.badgeTitle}>{b.t}</Text>
              <Text style={styles.badgeSub}>{b.s}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>NIGHTLIFE PASSPORT</Text>
        <View style={styles.passportCard}>
          <Text style={styles.passportPlaceholder}>
            Your map unlocks after your first check-in 🗺️
          </Text>
        </View>

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
    marginBottom: spacing.xl,
  },
  statCell: { flex: 1, alignItems: 'center', gap: 2 },
  statK: { color: colors.ink, fontSize: 24, fontWeight: '800' },
  statV: { color: colors.inkMute, fontSize: 11, letterSpacing: 0.6 },
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
});
