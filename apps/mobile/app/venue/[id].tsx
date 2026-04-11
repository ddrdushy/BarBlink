import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { colors, radii, spacing } from '@/constants/theme';
import { venueGet } from '@/lib/api';

interface VenueDetail {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  area: string | null;
  country: string;
  address: string | null;
  lat: string | null;
  lng: string | null;
  instagramHandle: string | null;
  barClosesAt: string | null;
  kitchenClosesAt: string | null;
  priceRange: number | null;
  crowdCapacity: number | null;
  googleRating: string | null;
  vibeTags: string[];
  genreTags: string[];
}

const PRICE_LABELS = ['', '$', '$$', '$$$', '$$$$'];
const CATEGORY_EMOJI: Record<string, string> = {
  club: '🪩', rooftop: '🌃', speakeasy: '🗝️', lounge: '🛋️', bar: '🍸',
};

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    venueGet<VenueDetail>(`/venues/${id}`)
      .then(setVenue)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.neon} size="large" />
        </View>
      </Screen>
    );
  }

  if (!venue) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.empty}>Venue not found</Text>
        </View>
      </Screen>
    );
  }

  const emoji = CATEGORY_EMOJI[venue.category || ''] || '🍸';

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>{'\u2190'}</Text>
          </Pressable>
          <Text style={styles.heroEmoji}>{emoji}</Text>
          <Text style={styles.heroCategory}>
            {(venue.category || '').toUpperCase()}
          </Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.name}>{venue.name}</Text>

          <View style={styles.metaRow}>
            {venue.area && (
              <Text style={styles.metaItem}>
                📍 {venue.area.replace(/_/g, ' ')}
              </Text>
            )}
            {venue.googleRating && (
              <Text style={styles.metaItem}>
                ⭐ {parseFloat(venue.googleRating).toFixed(1)}
              </Text>
            )}
            {venue.priceRange && (
              <Text style={styles.metaItem}>
                {PRICE_LABELS[venue.priceRange]}
              </Text>
            )}
          </View>

          {venue.description && (
            <Text style={styles.description}>{venue.description}</Text>
          )}

          {/* Info cards */}
          <View style={styles.infoGrid}>
            {venue.barClosesAt && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>BAR CLOSES</Text>
                <Text style={styles.infoValue}>{venue.barClosesAt}</Text>
              </View>
            )}
            {venue.kitchenClosesAt && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>KITCHEN CLOSES</Text>
                <Text style={styles.infoValue}>{venue.kitchenClosesAt}</Text>
              </View>
            )}
            {venue.crowdCapacity && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>CAPACITY</Text>
                <Text style={styles.infoValue}>{venue.crowdCapacity}</Text>
              </View>
            )}
            {venue.instagramHandle && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>INSTAGRAM</Text>
                <Text style={styles.infoValue}>@{venue.instagramHandle}</Text>
              </View>
            )}
          </View>

          {/* Tags */}
          {(venue.vibeTags.length > 0 || venue.genreTags.length > 0) && (
            <>
              <Text style={styles.sectionLabel}>VIBE & MUSIC</Text>
              <View style={styles.tagRow}>
                {[...venue.vibeTags, ...venue.genreTags].map((t) => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Address */}
          {venue.address && (
            <>
              <Text style={styles.sectionLabel}>ADDRESS</Text>
              <Text style={styles.address}>{venue.address}</Text>
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: colors.inkMute, fontSize: 15 },
  hero: {
    height: 200,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
  },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: colors.ink, fontSize: 20 },
  heroEmoji: { fontSize: 48 },
  heroCategory: {
    color: colors.neonBright,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginTop: 8,
  },
  body: { padding: spacing.xl },
  name: { color: colors.ink, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    marginBottom: spacing.lg,
  },
  metaItem: { color: colors.inkMute, fontSize: 14 },
  description: {
    color: colors.inkMute,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: spacing.xl,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: spacing.xl,
  },
  infoCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: spacing.md,
    minWidth: '46%',
    flex: 1,
  },
  infoLabel: {
    color: colors.inkFaint,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValue: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  sectionLabel: {
    color: colors.neonBright,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.xl,
  },
  tag: {
    backgroundColor: colors.neonGhost,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neonBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: { color: colors.neonBright, fontSize: 12, fontWeight: '600' },
  address: { color: colors.inkMute, fontSize: 14, lineHeight: 21 },
});
