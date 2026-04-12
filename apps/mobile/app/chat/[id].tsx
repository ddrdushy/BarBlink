import { useCallback, useEffect, useRef, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { io, Socket } from 'socket.io-client';
import { colors, radii, spacing, touchTarget } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { chatGet, CHAT_API } from '@/lib/api';

interface Message {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export default function ChatConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuth();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<Message>>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [convName, setConvName] = useState('Chat');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch initial messages via HTTP, then switch to Socket.io for real-time
  const fetchMessages = useCallback(async () => {
    if (!token || !id) return;
    try {
      const data = await chatGet<Message[]>(`/chat/conversations/${id}/messages`, token);
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      // Service might not be running yet
    }
  }, [token, id]);

  // Socket.io connection
  useEffect(() => {
    if (!token || !id) return;

    // Load initial messages
    fetchMessages().finally(() => setLoading(false));

    const socketUrl = CHAT_API.replace('/v1', '');
    const socket = io(`${socketUrl}/chat`, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('message.new', (msg: Message) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    socket.on('conversation.typing', (data: { userId: string; isTyping: boolean }) => {
      if (data.userId === user?.id) return; // ignore own typing
      setTypingUsers((prev) => {
        if (data.isTyping && !prev.includes(data.userId)) {
          return [...prev, data.userId];
        }
        if (!data.isTyping) {
          return prev.filter((uid) => uid !== data.userId);
        }
        return prev;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, id, fetchMessages, user?.id]);

  // Try to fetch conversation details for the header name
  useEffect(() => {
    if (!token || !id) return;
    (async () => {
      try {
        const conv = await chatGet<{ name: string | null; type: string }>(
          `/chat/conversations/${id}`,
          token,
        );
        if (conv?.name) setConvName(conv.name);
      } catch {
        /* silent */
      }
    })();
  }, [token, id]);

  const handleSend = async () => {
    if (!token || !id || !inputText.trim() || sending) return;
    setSending(true);
    try {
      socketRef.current?.emit('message.send', {
        conversationId: id,
        body: inputText.trim(),
      });
      setInputText('');
      // Stop typing indicator
      socketRef.current?.emit('typing.stop', { conversationId: id });
    } catch {
      /* silent */
    } finally {
      setSending(false);
    }
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    if (!id) return;

    // Emit typing start
    socketRef.current?.emit('typing.start', { conversationId: id });

    // Clear existing timeout and set new one to stop typing after 2s of inactivity
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing.stop', { conversationId: id });
    }, 2000);
  };

  const isMe = (senderId: string) => senderId === user?.id;

  const renderMessage = ({ item }: { item: Message }) => {
    const mine = isMe(item.senderId);
    return (
      <View style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.body}</Text>
          <Text style={[styles.bubbleTime, mine && styles.bubbleTimeMine]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={16} style={styles.backBtn}>
          <Text style={styles.backText}>{'\u2190'}</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {convName}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 56}
      >
        {/* Messages */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.neon} size="large" />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No messages yet. Say hi!</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <View style={styles.typingBar}>
            <Text style={styles.typingText}>
              {typingUsers.length === 1 ? 'Someone is typing...' : 'Multiple people typing...'}
            </Text>
          </View>
        )}

        {/* Input bar */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={handleTextChange}
            placeholder="Message..."
            placeholderTextColor={colors.inkFaint}
            multiline
            maxLength={2000}
          />
          <Pressable
            style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.sendText}>{'\u2191'}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: colors.ink, fontSize: 20 },
  headerTitle: {
    flex: 1,
    color: colors.ink,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.inkMute, fontSize: 14 },
  messageList: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '75%',
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: colors.neon,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: colors.bgSurface,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { color: colors.ink, fontSize: 15, lineHeight: 20 },
  bubbleTextMine: { color: '#fff' },
  bubbleTime: {
    color: colors.inkFaint,
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeMine: { color: 'rgba(255,255,255,0.7)' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: colors.bg,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    color: colors.ink,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendBtn: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: touchTarget / 2,
    backgroundColor: colors.neon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  typingBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 4,
  },
  typingText: {
    color: colors.inkFaint,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
