import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { colors, radii, spacing } from '@/constants/theme';

const stats = [
  { k: '23', v: 'Venues' },
  { k: '47', v: 'Check-ins' },
  { k: '7', v: 'Night streak' },
];

const badges = [
  { e: '🦉', t: 'Night Owl', s: '7-night streak' },
  { e: '🗺️', t: 'Explorer', s: '23 venues' },
  { e: '🥂', t: 'Curator', s: '0 collections' },
];

export default function Profile() {
  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 140 }}>
        <View style={styles.head}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 40 }}>🦉</Text>
          </View>
          <Text style={styles.name}>@owl_kl</Text>
          <Text style={styles.bio}>New to Barblink · KLCC</Text>
        </View>

        <View style={styles.stats}>
          {stats.map((s) => (
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
          <Text style={styles.passportPlaceholder}>Your KL map unlocks after your first check-in 🗺️</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  bio: { color: colors.inkMute, fontSize: 13 },
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
