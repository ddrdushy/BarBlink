import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { colors, radii, spacing } from '@/constants/theme';

const stories = [
  { name: 'You', color: '#C45AFF', live: false },
  { name: 'Aina', color: '#FF6F91', live: true },
  { name: 'Marc', color: '#2BC4FF', live: true },
  { name: 'Kenji', color: '#FFD166', live: true },
  { name: 'Nasha', color: '#4CD964', live: false },
];

export default function FeedScreen() {
  return (
    <Screen padded={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>
          blink<Text style={{ color: colors.neon }}>.</Text>feed
        </Text>
        <View style={styles.headerIcons}>
          <View style={styles.iconBtn}><Text style={styles.iconText}>🔔</Text></View>
          <View style={styles.iconBtn}><Text style={styles.iconText}>💬</Text></View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Stories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesRow}
        >
          {stories.map((s, i) => (
            <View key={i} style={styles.storyItem}>
              <View style={styles.storyRing}>
                <View style={[styles.storyInner, { backgroundColor: s.color }]} />
              </View>
              {s.live && <View style={styles.liveBadge} />}
              <Text style={styles.storyName}>{s.name}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Hero post */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['#C45AFF', '#7A2BBE', '#1a1a20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.75)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>📍 Zouk KL</Text>
          </View>
          <View style={styles.heroMeta}>
            <View style={styles.heroAvatarRow}>
              <View style={[styles.avatar, { backgroundColor: '#FF6F91' }]} />
              <Text style={styles.heroName}>marcus.kl</Text>
              <Text style={styles.heroTime}>· 12m</Text>
            </View>
            <Text style={styles.heroCaption}>Packed house tonight 🔥 KYRA going off</Text>
          </View>
          <View style={styles.heroStats}>
            <Text style={styles.heroStat}>❤️ 312</Text>
            <Text style={styles.heroStat}>💬 24</Text>
          </View>
        </View>

        {/* Check-in pair */}
        <View style={styles.checkinRow}>
          <CheckinCard name="Aina" venue="Kyo Bar" status="Packed" color={colors.crowdPacked} />
          <CheckinCard name="Kenji" venue="PS150" status="Lively" color={colors.crowdLively} />
        </View>

        {/* Buddy activity */}
        <View style={styles.buddyCard}>
          <View style={[styles.avatar, { backgroundColor: '#FFD166', marginRight: 12 }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.buddyText}>
              <Text style={styles.buddyName}>Nasha</Text> is looking for a buddy tonight
            </Text>
            <Text style={styles.buddyTags}>🎧 House · KLCC</Text>
          </View>
          <View style={styles.buddyBtn}>
            <Text style={styles.buddyBtnText}>Say hi</Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function CheckinCard({ name, venue, status, color }: { name: string; venue: string; status: string; color: string }) {
  return (
    <View style={styles.checkinCard}>
      <View style={styles.checkinHeader}>
        <View style={[styles.avatarSm, { backgroundColor: colors.neon }]} />
        <Text style={styles.checkinName}>{name} is at</Text>
      </View>
      <Text style={styles.checkinVenue}>{venue}</Text>
      <View style={styles.checkinStatus}>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <Text style={[styles.statusText, { color }]}>{status}</Text>
      </View>
    </View>
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
  appName: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  iconText: { fontSize: 16 },
  storiesRow: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  storyItem: { alignItems: 'center', gap: 6, position: 'relative' },
  storyRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2.5,
    borderColor: colors.neon,
    padding: 2.5,
  },
  storyInner: { flex: 1, borderRadius: 28 },
  liveBadge: {
    position: 'absolute',
    right: 2,
    top: 48,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.live,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  storyName: { color: colors.ink, fontSize: 11 },
  heroCard: {
    marginHorizontal: spacing.xl,
    height: 380,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neonBorder,
  },
  heroBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  heroBadgeText: { color: colors.ink, fontSize: 11, fontWeight: '700' },
  heroMeta: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 80,
    gap: 6,
  },
  heroAvatarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 26, height: 26, borderRadius: 13 },
  avatarSm: { width: 18, height: 18, borderRadius: 9 },
  heroName: { color: colors.ink, fontWeight: '700', fontSize: 13 },
  heroTime: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
  heroCaption: { color: colors.ink, fontSize: 14, lineHeight: 19 },
  heroStats: {
    position: 'absolute',
    right: 14,
    bottom: 16,
    gap: 10,
  },
  heroStat: { color: colors.ink, fontSize: 12, fontWeight: '600' },
  checkinRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  checkinCard: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.neonBorder,
    padding: 14,
    gap: 6,
  },
  checkinHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkinName: { color: colors.inkMute, fontSize: 11 },
  checkinVenue: { color: colors.neon, fontSize: 16, fontWeight: '800', letterSpacing: -0.4 },
  checkinStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  buddyCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,159,10,0.3)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buddyText: { color: colors.ink, fontSize: 13 },
  buddyName: { fontWeight: '700' },
  buddyTags: { color: colors.amber, fontSize: 11, marginTop: 2 },
  buddyBtn: {
    backgroundColor: 'rgba(255,159,10,0.15)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  buddyBtnText: { color: colors.amber, fontSize: 12, fontWeight: '700' },
});
