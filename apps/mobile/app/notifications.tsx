import { useEffect, useState, useCallback } from 'react';
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
import { notifGet, notifPost } from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

interface NotifResponse {
  items: Notification[];
  total: number;
}

const NOTIF_ICONS: Record<string, string> = {
  follow: '👤',
  like: '❤️',
  comment: '💬',
  checkin: '📍',
  badge: '🏆',
  system: '🔔',
};

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const data = await notifGet<NotifResponse>('/notifications', token);
      setNotifications(data.items || []);
    } catch {
      // API might not be available yet, show empty state gracefully
      setNotifications([]);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications().finally(() => setLoading(false));
  }, [fetchNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markAllRead = async () => {
    if (!token) return;
    try {
      await notifPost('/notifications/read-all', {}, token);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silent
    }
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backBtn}>{'<'} Back</Text>
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        {hasUnread ? (
          <Pressable onPress={markAllRead} hitSlop={8}>
            <Text style={styles.markRead}>Mark all read</Text>
          </Pressable>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.neon} size="large" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🔔</Text>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySub}>
            When someone follows you, likes your post, or you earn a badge, it will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n) => n.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.neon} />
          }
          contentContainerStyle={{ paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => (
            <View style={[styles.notifRow, !item.read && styles.notifUnread]}>
              <View style={styles.notifIcon}>
                <Text style={{ fontSize: 20 }}>
                  {NOTIF_ICONS[item.type] || NOTIF_ICONS.system}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifBody} numberOfLines={2}>
                  {item.body}
                </Text>
                <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </View>
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
  markRead: { color: colors.neonBright, fontSize: 13, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: spacing.xl },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  emptySub: { color: colors.inkMute, fontSize: 14, textAlign: 'center', maxWidth: 280 },
  sep: { height: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: 12,
    minHeight: touchTarget,
  },
  notifUnread: {
    backgroundColor: 'rgba(196, 90, 255, 0.04)',
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  notifBody: { color: colors.inkMute, fontSize: 13, lineHeight: 18, marginTop: 2 },
  notifTime: { color: colors.inkFaint, fontSize: 11, marginTop: 4 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neon,
    marginTop: 6,
  },
});
