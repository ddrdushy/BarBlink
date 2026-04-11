import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { colors, radii, spacing, touchTarget } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { socialGet, socialPost, socialDelete } from '@/lib/api';

interface PostDetail {
  id: string;
  userId: string;
  venueId: string | null;
  caption: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  isLikedByMe: boolean;
}

interface CommentItem {
  id: string;
  userId: string;
  body: string;
  createdAt: string;
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!id || !token) return;
    Promise.all([
      socialGet<PostDetail>(`/posts/${id}`, token),
      socialGet<CommentItem[]>(`/posts/${id}/comments`, token),
    ])
      .then(([p, c]) => { setPost(p); setComments(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, token]);

  const toggleLike = async () => {
    if (!post || !token) return;
    const was = post.isLikedByMe;
    setPost({ ...post, isLikedByMe: !was, likeCount: was ? post.likeCount - 1 : post.likeCount + 1 });
    try {
      if (was) await socialDelete(`/posts/${post.id}/like`, token);
      else await socialPost(`/posts/${post.id}/like`, {}, token);
    } catch {
      setPost({ ...post, isLikedByMe: was, likeCount: post.likeCount });
    }
  };

  const handleComment = async () => {
    if (!token || !id || !commentText.trim()) return;
    setPosting(true);
    try {
      const c = await socialPost<CommentItem>(`/posts/${id}/comments`, { body: commentText.trim() }, token);
      setComments((prev) => [...prev, c]);
      setCommentText('');
      if (post) setPost({ ...post, commentCount: post.commentCount + 1 });
    } catch { /* silent */ }
    setPosting(false);
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

  if (!post) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.empty}>Post not found</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>{'\u2190'} Back</Text>
          </Pressable>
        </View>

        <FlatList
          data={comments}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 20 }}
          ListHeaderComponent={
            <View style={styles.postSection}>
              <Text style={styles.caption}>{post.caption || 'No caption'}</Text>
              <Text style={styles.time}>{timeAgo(post.createdAt)}</Text>
              <View style={styles.actions}>
                <Pressable onPress={toggleLike} style={styles.actionBtn}>
                  <Text style={styles.actionText}>
                    {post.isLikedByMe ? '❤️' : '🤍'} {post.likeCount} likes
                  </Text>
                </Pressable>
                <Text style={styles.actionText}>💬 {post.commentCount} comments</Text>
              </View>
              <View style={styles.divider} />
              {comments.length === 0 && (
                <Text style={styles.noComments}>No comments yet. Be the first!</Text>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.commentRow}>
              <View style={styles.commentAvatar}>
                <Text style={{ fontSize: 12 }}>🦉</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.commentBody}>{item.body}</Text>
                <Text style={styles.commentTime}>{timeAgo(item.createdAt)}</Text>
              </View>
            </View>
          )}
        />

        {/* Comment input */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.commentInput}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Add a comment..."
            placeholderTextColor={colors.inkFaint}
            maxLength={500}
          />
          <Pressable
            style={[styles.sendBtn, !commentText.trim() && { opacity: 0.4 }]}
            onPress={handleComment}
            disabled={!commentText.trim() || posting}
          >
            <Text style={styles.sendText}>{posting ? '...' : '→'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: colors.inkMute, fontSize: 15 },
  header: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  back: { color: colors.inkMute, fontSize: 15, fontWeight: '600' },
  postSection: { paddingTop: spacing.md, paddingBottom: spacing.md },
  caption: { color: colors.ink, fontSize: 18, fontWeight: '600', lineHeight: 26 },
  time: { color: colors.inkFaint, fontSize: 12, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 20, marginTop: 16 },
  actionBtn: {},
  actionText: { color: colors.inkMute, fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginTop: 16, marginBottom: 12 },
  noComments: { color: colors.inkFaint, fontSize: 13, textAlign: 'center', paddingVertical: 20 },
  commentRow: { flexDirection: 'row', gap: 10, paddingVertical: 10 },
  commentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  commentBody: { color: colors.ink, fontSize: 14, lineHeight: 20 },
  commentTime: { color: colors.inkFaint, fontSize: 11, marginTop: 2 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: colors.bg,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.ink,
    fontSize: 14,
    minHeight: touchTarget,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neonGhost,
    borderWidth: 1,
    borderColor: colors.neonBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { color: colors.neonBright, fontSize: 18, fontWeight: '700' },
});
