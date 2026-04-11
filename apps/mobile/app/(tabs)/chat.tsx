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
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { colors, radii, spacing, touchTarget } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { chatGet } from '@/lib/api';

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
});
