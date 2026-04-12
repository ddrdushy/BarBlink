import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { colors, radii, spacing } from '@/constants/theme';

export default function NeighbourhoodFeedScreen() {
  const router = useRouter();
  const { area } = useLocalSearchParams<{ area: string }>();

  const displayName = (area || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backBtn}>{'<'} Back</Text>
        </Pressable>
        <Text style={styles.title}>{displayName}</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.emoji}>📍</Text>
          <Text style={styles.cardTitle}>{displayName}</Text>
          <Text style={styles.cardText}>
            Feed for {displayName} coming soon — check back when more people check in here!
          </Text>
        </View>
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: spacing.xxl,
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  emoji: { fontSize: 48 },
  cardTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  cardText: {
    color: colors.inkMute,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
});
