import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { NeonButton } from '@/components/NeonButton';
import { colors, radii, spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { communityGet, communityPost, communityDelete, venueGet } from '@/lib/api';

interface CollectionDetail {
  id: string;
  name: string;
  venues: CollectionVenue[];
}

interface CollectionVenue {
  id: string;
  venueId: string;
  name: string;
  area?: string;
  category?: string;
}

interface VenueSearchItem {
  id: string;
  name: string;
  area?: string;
  category?: string;
}

interface VenueListResponse {
  items: VenueSearchItem[];
  total: number;
}

export default function CollectionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [allVenues, setAllVenues] = useState<VenueSearchItem[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(false);

  const fetchCollection = useCallback(async () => {
    if (!token || !id) return;
    try {
      const data = await communityGet<CollectionDetail>(
        `/community/collections/${id}`,
        token,
      );
      setCollection(data);
    } catch {
      // silent
    }
  }, [token, id]);

  useEffect(() => {
    fetchCollection().finally(() => setLoading(false));
  }, [fetchCollection]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCollection();
    setRefreshing(false);
  }, [fetchCollection]);

  const openPicker = async () => {
    setPickerVisible(true);
    setLoadingVenues(true);
    try {
      const data = await venueGet<VenueListResponse>('/venues?limit=50');
      setAllVenues(data.items ?? (data as unknown as VenueSearchItem[]));
    } catch {
      // silent
    } finally {
      setLoadingVenues(false);
    }
  };

  const addVenue = async (venueId: string) => {
    if (!token || !id) return;
    try {
      await communityPost(
        `/community/collections/${id}/venues`,
        { venueId },
        token,
      );
      setPickerVisible(false);
      await fetchCollection();
    } catch {
      // silent
    }
  };

  const removeVenue = async (venueId: string) => {
    if (!token || !id) return;
    Alert.alert('Remove Venue', 'Remove this venue from the collection?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await communityDelete(
              `/community/collections/${id}/venues/${venueId}`,
              token,
            );
            await fetchCollection();
          } catch {
            // silent
          }
        },
      },
    ]);
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

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backBtn}>{'<'}</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {collection?.name ?? 'Collection'}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={collection?.venues ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.neon}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No venues yet</Text>
            <Text style={styles.emptySubtext}>
              Tap "Add Venue" to start curating
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onLongPress={() => removeVenue(item.venueId)}
          >
            <View style={styles.venueIcon}>
              <Text style={{ fontSize: 20 }}>{'<pin>'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.venueName}>{item.name}</Text>
              {item.area ? (
                <Text style={styles.venueMeta}>
                  {item.area}
                  {item.category ? ` / ${item.category}` : ''}
                </Text>
              ) : null}
            </View>
          </Pressable>
        )}
      />

      <View style={styles.fab}>
        <NeonButton label="Add Venue" onPress={openPicker} />
      </View>

      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pick a Venue</Text>
              <Pressable onPress={() => setPickerVisible(false)}>
                <Text style={styles.closeBtn}>X</Text>
              </Pressable>
            </View>
            {loadingVenues ? (
              <ActivityIndicator
                color={colors.neon}
                size="large"
                style={{ marginTop: 40 }}
              />
            ) : (
              <FlatList
                data={allVenues}
                keyExtractor={(v) => v.id}
                style={{ maxHeight: 400 }}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.pickerItem}
                    onPress={() => addVenue(item.id)}
                  >
                    <Text style={styles.pickerName}>{item.name}</Text>
                    <Text style={styles.pickerMeta}>
                      {item.area ?? ''} {item.category ? `/ ${item.category}` : ''}
                    </Text>
                  </Pressable>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptySubtext}>No venues available</Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  backBtn: { color: colors.neonBright, fontSize: 24, fontWeight: '700' },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: spacing.lg,
    gap: 12,
  },
  venueIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.neonGhost,
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueName: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  venueMeta: { color: colors.inkMute, fontSize: 12, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyText: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  emptySubtext: {
    color: colors.inkMute,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    left: spacing.xl,
    right: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  closeBtn: { color: colors.inkMute, fontSize: 18, fontWeight: '700', padding: 4 },
  pickerItem: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  pickerName: { color: colors.ink, fontSize: 15, fontWeight: '600' },
  pickerMeta: { color: colors.inkMute, fontSize: 12, marginTop: 2 },
});
