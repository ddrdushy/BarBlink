import { useCallback, useEffect, useState } from 'react';
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
import { colors, radii, spacing, touchTarget } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { chatGet, chatPost, userGet } from '@/lib/api';

interface Conversation {
  id: string;
  type: string;
  name: string | null;
  createdAt: string;
}

interface ConversationList {
  items: Conversation[];
  total: number;
}

export default function ChatTab() {
  const router = useRouter();
  const { token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; username: string; displayName: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!token) return;
    try {
      const data = await chatGet<Conversation[]>('/chat/conversations', token);
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      // Service might not be running yet
    }
  }, [token]);

  useEffect(() => {
    fetchConversations().finally(() => setLoading(false));
  }, [fetchConversations]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!token || q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await userGet<{ id: string; username: string; displayName: string }[]>(
        `/users/search?q=${encodeURIComponent(q.trim())}`,
        token,
      );
      setSearchResults(Array.isArray(results) ? results : []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleStartDM = async (targetUserId: string) => {
    if (!token || creating) return;
    setCreating(true);
    try {
      const conv = await chatPost<{ id: string }>(
        '/chat/conversations',
        { type: 'dm', participantIds: [targetUserId] },
        token,
      );
      setNewChatOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      await fetchConversations();
      router.push(`/chat/${conv.id}`);
    } catch {
      /* silent */
    } finally {
      setCreating(false);
    }
  };

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.neon} size="large" />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySub}>
            Start chatting with your crew when the friends system is live
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 140 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.neon} />
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.convRow}
              onPress={() => router.push(`/chat/${item.id}`)}
            >
              <View style={styles.convAvatar}>
                <Text style={{ fontSize: 18 }}>{item.type === 'group' ? '👥' : '🦉'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.convName}>{item.name || 'Direct Message'}</Text>
                <Text style={styles.convPreview}>Tap to view messages</Text>
              </View>
              <Text style={styles.convTime}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </Pressable>
          )}
        />
      )}

      {/* New Chat FAB */}
      <Pressable style={styles.fab} onPress={() => setNewChatOpen(true)}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      {/* New Chat Modal */}
      <Modal
        visible={newChatOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setNewChatOpen(false)}
      >
        <View style={newChat.root}>
          <View style={newChat.handle} />
          <View style={newChat.headerRow}>
            <Text style={newChat.title}>New Chat</Text>
            <Pressable
              onPress={() => { setNewChatOpen(false); setSearchQuery(''); setSearchResults([]); }}
              hitSlop={16}
              style={newChat.closeBtn}
            >
              <Text style={newChat.closeText}>{'\u2715'}</Text>
            </Pressable>
          </View>

          <TextInput
            style={newChat.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search users..."
            placeholderTextColor={colors.inkFaint}
            autoFocus
          />

          {searching ? (
            <View style={{ padding: spacing.xl, alignItems: 'center' }}>
              <ActivityIndicator color={colors.neon} />
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(u) => u.id}
              contentContainerStyle={{ paddingBottom: 40 }}
              ItemSeparatorComponent={() => <View style={newChat.sep} />}
              renderItem={({ item }) => (
                <Pressable
                  style={newChat.userRow}
                  onPress={() => handleStartDM(item.id)}
                  disabled={creating}
                >
                  <View style={newChat.avatar}>
                    <Text style={{ fontSize: 16 }}>{'\uD83E\uDD89'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={newChat.displayName}>{item.displayName}</Text>
                    <Text style={newChat.username}>@{item.username}</Text>
                  </View>
                </Pressable>
              )}
            />
          ) : searchQuery.trim().length >= 2 ? (
            <View style={{ padding: spacing.xl, alignItems: 'center' }}>
              <Text style={{ color: colors.inkMute, fontSize: 14 }}>No users found</Text>
            </View>
          ) : (
            <View style={{ padding: spacing.xl, alignItems: 'center' }}>
              <Text style={{ color: colors.inkMute, fontSize: 14 }}>
                Type at least 2 characters to search
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl + 20,
    paddingBottom: spacing.lg,
  },
  title: { color: colors.ink, fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  emptySub: { color: colors.inkMute, fontSize: 14, textAlign: 'center', maxWidth: 280 },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: spacing.lg,
    marginBottom: spacing.sm,
    gap: 12,
    minHeight: touchTarget,
  },
  convAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  convName: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  convPreview: { color: colors.inkMute, fontSize: 12, marginTop: 2 },
  convTime: { color: colors.inkFaint, fontSize: 11 },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neon,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.neon,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '600', marginTop: -2 },
});

const newChat = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: 12 },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.inkHint,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: { color: colors.inkMute, fontSize: 14 },
  searchInput: {
    marginHorizontal: 20,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    color: colors.ink,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  sep: { height: 1, backgroundColor: 'rgba(255,255,255,0.04)', marginHorizontal: 20 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: touchTarget,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayName: { color: colors.ink, fontSize: 15, fontWeight: '600' },
  username: { color: colors.inkMute, fontSize: 12, marginTop: 1 },
});
