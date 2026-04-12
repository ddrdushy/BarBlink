import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { colors, radii, spacing, touchTarget } from '@/constants/theme';
import { venueGet, checkinGet } from '@/lib/api';
import { useAuth } from '@/context/auth';
import { userGet } from '@/lib/api';

interface VenueItem {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  area: string | null;
  country: string;
  barClosesAt: string | null;
  priceRange: number | null;
  googleRating: string | null;
  description: string | null;
  vibeTags: string[];
}

interface VenueListResponse {
  items: VenueItem[];
  total: number;
  page: number;
  totalPages: number;
}

const FILTERS = ['All', 'bar', 'club', 'rooftop', 'lounge', 'speakeasy'] as const;

const CATEGORY_LABELS: Record<string, string> = {
  All: 'All',
  bar: 'Bars',
  club: 'Clubs',
  rooftop: 'Rooftop',
  lounge: 'Lounge',
  speakeasy: 'Speakeasy',
};

const PRICE_LABELS = ['', '$', '$$', '$$$', '$$$$'];

export default function Discover() {
  const router = useRouter();
  const { token } = useAuth();
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [crowdCounts, setCrowdCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('All');
  const [country, setCountry] = useState<string>('MY');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const fetchVenues = useCallback(async (cat: string, ctry: string) => {
    try {
      const params = new URLSearchParams({ country: ctry });
      if (cat !== 'All') params.set('category', cat);
      const data = await venueGet<VenueListResponse>(`/venues?${params}`);
      setVenues(data.items);

      // Fetch crowd counts for all venues
      const counts: Record<string, number> = {};
      await Promise.all(
        data.items.map(async (v) => {
          try {
            const r = await checkinGet<{ count: number }>(`/checkins/venue/${v.id}`);
            if (r.count > 0) counts[v.id] = r.count;
          } catch { /* silent */ }
        }),
      );
      setCrowdCounts(counts);
    } catch {
      // silently fail, keep stale data
    }
  }, []);

  // Get user's country from profile
  useEffect(() => {
    if (!token) return;
    userGet<{ country: string }>('/users/me', token)
      .then((p) => {
        if (p.country) setCountry(p.country);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    setLoading(true);
    fetchVenues(filter, country).finally(() => setLoading(false));
  }, [filter, country, fetchVenues]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVenues(filter, country);
    setRefreshing(false);
  };

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Discover</Text>
            <Text style={styles.sub}>
              {country === 'LK' ? '🇱🇰 Colombo' : '🇲🇾 Kuala Lumpur'}
            </Text>
          </View>
          <View style={styles.viewToggle}>
            <Pressable
              style={[styles.toggleBtn, viewMode === 'list' && styles.toggleActive]}
              onPress={() => setViewMode('list')}
            >
              <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>List</Text>
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, viewMode === 'map' && styles.toggleActive]}
              onPress={() => setViewMode('map')}
            >
              <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>Map</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {CATEGORY_LABELS[f]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {viewMode === 'map' ? (
        <MapView venues={venues} crowdCounts={crowdCounts} country={country} />
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.neon} size="large" />
        </View>
      ) : venues.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>No venues found</Text>
        </View>
      ) : (
        <FlatList
          data={venues}
          keyExtractor={(v) => v.id}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 140 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.neon} />
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/venue/${item.id}`)}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardIcon}>
                  <Text style={{ fontSize: 20 }}>
                    {item.category === 'club' ? '🪩' :
                     item.category === 'rooftop' ? '🌃' :
                     item.category === 'speakeasy' ? '🗝️' :
                     item.category === 'lounge' ? '🛋️' : '🍸'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardMeta}>
                    {item.category} {item.area ? `· ${item.area.replace(/_/g, ' ')}` : ''}
                  </Text>
                </View>
                {crowdCounts[item.id] ? (
                  <View style={styles.crowdBadge}>
                    <Text style={styles.crowdBadgeText}>{crowdCounts[item.id]} here</Text>
                  </View>
                ) : null}
                {item.googleRating && (
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>{parseFloat(item.googleRating).toFixed(1)}</Text>
                  </View>
                )}
              </View>

              {item.description && (
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              )}

              <View style={styles.cardBottom}>
                {item.barClosesAt && (
                  <Text style={styles.cardTag}>Closes {item.barClosesAt}</Text>
                )}
                {item.priceRange && (
                  <Text style={styles.cardTag}>{PRICE_LABELS[item.priceRange]}</Text>
                )}
                {item.vibeTags.slice(0, 2).map((t) => (
                  <Text key={t} style={styles.cardTag}>{t}</Text>
                ))}
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

function MapView({ venues, crowdCounts, country }: {
  venues: VenueItem[];
  crowdCounts: Record<string, number>;
  country: string;
}) {
  const center = country === 'LK' ? [6.9110, 79.8498] : [3.1480, 101.7100];
  const zoom = country === 'LK' ? 13 : 13;

  const markers = venues
    .filter((v) => v.googleRating) // venues with data are more likely to have coords
    .map((v) => ({
      id: v.id,
      name: v.name,
      category: v.category || 'bar',
      area: v.area?.replace(/_/g, ' ') || '',
      crowd: crowdCounts[v.id] || 0,
    }));

  const html = `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>body{margin:0;padding:0}#map{width:100%;height:100vh}</style>
</head><body>
<div id="map"></div>
<script>
var map=L.map('map').setView([${center[0]},${center[1]}],${zoom});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution:'OpenStreetMap',maxZoom:18
}).addTo(map);
var venues=${JSON.stringify(markers)};
// Spread markers around the center for visual effect since we don't have exact GPS for all
venues.forEach(function(v,i){
  var angle=(i/venues.length)*2*Math.PI;
  var r=0.005+Math.random()*0.01;
  var lat=${center[0]}+Math.cos(angle)*r;
  var lng=${center[1]}+Math.sin(angle)*r;
  var color=v.crowd>0?'#4CD964':'#C45AFF';
  var icon=L.divIcon({className:'',html:'<div style="background:'+color+';width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 6px '+color+'"></div>',iconSize:[16,16],iconAnchor:[8,8]});
  L.marker([lat,lng],{icon:icon}).addTo(map).bindPopup('<b>'+v.name+'</b><br>'+v.category+(v.crowd>0?' · <span style="color:#4CD964">'+v.crowd+' here</span>':''));
});
</script>
</body></html>`;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ html }}
        style={{ flex: 1 }}
        javaScriptEnabled
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl + 20,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.bgSurface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  toggleActive: {
    backgroundColor: colors.neonGhost,
  },
  toggleText: {
    color: colors.inkMute,
    fontSize: 12,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: colors.neonBright,
  },
  title: { color: colors.ink, fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  sub: { color: colors.inkMute, fontSize: 14, marginTop: 4 },
  chips: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    minHeight: touchTarget,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.neonGhost,
    borderColor: colors.neonBorder,
  },
  chipText: { color: colors.inkMute, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.neonBright },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: colors.inkMute, fontSize: 15 },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  cardMeta: { color: colors.inkMute, fontSize: 12, marginTop: 2, textTransform: 'capitalize' },
  crowdBadge: {
    backgroundColor: 'rgba(50,215,75,0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  crowdBadgeText: { color: colors.crowdQuiet, fontSize: 11, fontWeight: '700' },
  ratingBadge: {
    backgroundColor: colors.bgElevated,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: { color: colors.crowdLively, fontSize: 13, fontWeight: '700' },
  cardDesc: { color: colors.inkMute, fontSize: 13, lineHeight: 19, marginTop: 10 },
  cardBottom: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  cardTag: {
    color: colors.inkFaint,
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: colors.bgElevated,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
});
