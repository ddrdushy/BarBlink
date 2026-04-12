import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { colors, radii, spacing, touchTarget } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { communityGet, userGet } from '@/lib/api';

interface NeighbourhoodGroup {
  id: string;
  name: string;
  area: string;
  country: string;
}

const COUNTRY_LABELS: Record<string, string> = {
  MY: '\u{1F1F2}\u{1F1FE} Kuala Lumpur',
  LK: '\u{1F1F1}\u{1F1F0} Colombo',
};

export default function NeighbourhoodsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [groups, setGroups] = useState<NeighbourhoodGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState('MY');

  useEffect(() => {
    if (!token) return;
    userGet<{ country: string }>('/users/me', token)
      .then((p) => {
        if (p.country) setCountry(p.country);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    communityGet<NeighbourhoodGroup[]>(
      `/community/neighbourhoods?country=${country}`,
      token,
    )
      .then(setGroups)
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, [token, country]);

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backBtn}>{'<'} Back</Text>
        </Pressable>
        <Text style={styles.title}>Your Scene</Text>
        <View style={{ width: 60 }} />
      </View>

      <Text style={styles.countryLabel}>{COUNTRY_LABELS[country] || country}</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.neon} size="large" />
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🏙️</Text>
          <Text style={styles.emptyTitle}>No neighbourhoods yet</Text>
          <Text style={styles.emptySub}>Check back soon</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(g) => g.id}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/neighbourhoods/${item.area}`)}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardIcon}>
                  <Text style={{ fontSize: 20 }}>📍</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardSub}>Active tonight</Text>
                </View>
                <Text style={styles.cardArrow}>›</Text>
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
    paddingBottom: spacing.md,
  },
  backBtn: { color: colors.neonBright, fontSize: 15, fontWeight: '600' },
  title: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  countryLabel: {
    color: colors.inkMute,
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
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
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  cardSub: { color: colors.inkMute, fontSize: 12, marginTop: 2 },
  cardArrow: { color: colors.inkMute, fontSize: 22, fontWeight: '300' },
});
