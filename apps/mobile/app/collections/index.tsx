import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { NeonButton } from '@/components/NeonButton';
import { colors, radii, spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { communityGet, communityPost } from '@/lib/api';

interface Collection {
  id: string;
  name: string;
  venueCount: number;
  createdAt: string;
}

interface CollectionsResponse {
  items: Collection[];
  total: number;
}

export default function Collections() {
  const router = useRouter();
  const { token } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchCollections = useCallback(async () => {
    if (!token) return;
    try {
      const data = await communityGet<CollectionsResponse>(
        '/community/collections/me',
        token,
      );
      setCollections(data.items ?? (data as unknown as Collection[]));
    } catch {
      // silent
    }
  }, [token]);

  useEffect(() => {
    fetchCollections().finally(() => setLoading(false));
  }, [fetchCollections]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCollections();
    setRefreshing(false);
  }, [fetchCollections]);

  const handleCreate = async () => {
    if (!token || !newName.trim()) return;
    setCreating(true);
    try {
      await communityPost('/community/collections', { name: newName.trim() }, token);
      setNewName('');
      setModalVisible(false);
      await fetchCollections();
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
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
        <Text style={styles.title}>My Collections</Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={collections}
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
            <Text style={styles.emptyEmoji}>{'<box>'}</Text>
            <Text style={styles.emptyText}>No collections yet</Text>
            <Text style={styles.emptySubtext}>
              Create a collection to save your favourite venues
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/collections/${item.id}`)}
          >
            <View style={styles.cardIcon}>
              <Text style={{ fontSize: 22 }}>{'<star>'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardCount}>
                {item.venueCount} {item.venueCount === 1 ? 'venue' : 'venues'}
              </Text>
            </View>
            <Text style={styles.chevron}>{'>'}</Text>
          </Pressable>
        )}
      />

      <View style={styles.fab}>
        <NeonButton label="Create Collection" onPress={() => setModalVisible(true)} />
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Collection</Text>
            <TextInput
              style={styles.input}
              placeholder="Collection name"
              placeholderTextColor={colors.inkFaint}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              maxLength={50}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => {
                  setNewName('');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <NeonButton
                label={creating ? 'Creating...' : 'Create'}
                onPress={handleCreate}
                disabled={!newName.trim() || creating}
              />
            </View>
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
  title: { color: colors.ink, fontSize: 18, fontWeight: '800' },
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
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.neonGhost,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  cardCount: { color: colors.inkMute, fontSize: 12, marginTop: 2 },
  chevron: { color: colors.inkMute, fontSize: 18 },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyEmoji: { fontSize: 40, color: colors.inkFaint },
  emptyText: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  emptySubtext: { color: colors.inkMute, fontSize: 13, textAlign: 'center', maxWidth: 260 },
  fab: {
    position: 'absolute',
    bottom: 32,
    left: spacing.xl,
    right: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.bgElevated,
    borderRadius: radii.lg,
    padding: spacing.xl,
    width: '85%',
    gap: 16,
  },
  modalTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  input: {
    backgroundColor: colors.bgSurface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.neonBorder,
    padding: spacing.lg,
    color: colors.ink,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  cancelText: { color: colors.inkMute, fontSize: 15, fontWeight: '600' },
});
