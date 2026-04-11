import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { NeonButton } from '@/components/NeonButton';
import { colors, radii, spacing, touchTarget } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { checkinPost, checkinGet, checkinDelete, venueGet, userGet } from '@/lib/api';

interface ActiveCheckin {
  id: string;
  venueId: string;
  checkedInAt: string;
}

interface VenueItem {
  id: string;
  name: string;
  category: string | null;
  area: string | null;
}

interface VenueListResponse {
  items: VenueItem[];
  total: number;
}

export default function CheckinTab() {
  const { token } = useAuth();
  const [active, setActive] = useState<ActiveCheckin | null>(null);
  const [venueName, setVenueName] = useState('');
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState<string | null>(null); // venueId being checked into
  const [refreshing, setRefreshing] = useState(false);

  const fetchState = useCallback(async () => {
    if (!token) return;
    try {
      // Get active check-in
      const checkin = await checkinGet<ActiveCheckin | null>('/checkins/active', token);
      setActive(checkin);

      if (checkin) {
        // Fetch venue name for active check-in
        const venue = await venueGet<{ name: string }>(`/venues/${checkin.venueId}`);
        setVenueName(venue.name);
      } else {
        // Fetch venues to check into
        const profile = await userGet<{ country: string }>('/users/me', token);
        const data = await venueGet<VenueListResponse>(`/venues?country=${profile.country}&limit=50`);
        setVenues(data.items);
      }
    } catch {
      // silent
    }
  }, [token]);

  useEffect(() => {
    fetchState().finally(() => setLoading(false));
  }, [fetchState]);

  const handleCheckin = async (venueId: string) => {
    if (!token) return;
    setChecking(venueId);
    try {
      await checkinPost('/checkins', { venueId }, token);
      await fetchState();
    } catch {
      // silent
    } finally {
      setChecking(null);
    }
  };

  const handleCheckout = async () => {
    if (!token || !active) return;
    setLoading(true);
    try {
      await checkinDelete(`/checkins/${active.id}`, token);
      setActive(null);
      setVenueName('');
      await fetchState();
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchState();
    setRefreshing(false);
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

  // Active check-in view
  if (active) {
    const since = new Date(active.checkedInAt);
    const mins = Math.floor((Date.now() - since.getTime()) / 60000);
    const hrs = Math.floor(mins / 60);
    const duration = hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;

    return (
      <Screen>
        <View style={styles.header}>
          <Text style={styles.title}>You're out!</Text>
        </View>

        <View style={styles.activeCard}>
          <Text style={styles.activeEmoji}>📍</Text>
          <Text style={styles.activeName}>{venueName}</Text>
          <Text style={styles.activeDuration}>{duration} checked in</Text>
          <Text style={styles.activeSince}>
            Since {since.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        <NeonButton label="Check out" variant="ghost" onPress={handleCheckout} />
      </Screen>
    );
  }

  // Venue list to check into
  return (
    <Screen padded={false}>
      <View style={styles.header2}>
        <Text style={styles.title}>Check in</Text>
        <Text style={styles.sub}>Tap a venue to let your crew know where you are</Text>
      </View>

      <FlatList
        data={venues}
        keyExtractor={(v) => v.id}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 140 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.neon} />
        }
        renderItem={({ item }) => (
          <View style={styles.venueRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.venueName}>{item.name}</Text>
              <Text style={styles.venueMeta}>
                {item.category}{item.area ? ` · ${item.area.replace(/_/g, ' ')}` : ''}
              </Text>
            </View>
            <Pressable
              style={styles.checkinBtn}
              onPress={() => handleCheckin(item.id)}
              disabled={checking === item.id}
            >
              {checking === item.id ? (
                <ActivityIndicator color={colors.neon} size="small" />
              ) : (
                <Text style={styles.checkinBtnText}>Check in</Text>
              )}
            </Pressable>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: spacing.xxl, gap: spacing.sm, paddingBottom: spacing.xl },
  header2: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl + 20, paddingBottom: spacing.lg },
  title: { color: colors.ink, fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  sub: { color: colors.inkMute, fontSize: 14, marginTop: 4 },
  activeCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.neonBorder,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.xl,
  },
  activeEmoji: { fontSize: 40 },
  activeName: { color: colors.ink, fontSize: 24, fontWeight: '800' },
  activeDuration: { color: colors.neonBright, fontSize: 18, fontWeight: '700' },
  activeSince: { color: colors.inkMute, fontSize: 13 },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: spacing.lg,
    marginBottom: spacing.sm,
    gap: 12,
  },
  venueName: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  venueMeta: { color: colors.inkMute, fontSize: 12, marginTop: 2, textTransform: 'capitalize' },
  checkinBtn: {
    backgroundColor: colors.neonGhost,
    borderWidth: 1,
    borderColor: colors.neonBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: touchTarget,
    justifyContent: 'center',
  },
  checkinBtnText: { color: colors.neonBright, fontSize: 13, fontWeight: '700' },
});
