import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { socialGet, socialPost } from '@/lib/api';

const { width: SCREEN_W } = Dimensions.get('window');
const STORY_DURATION = 5000; // ms

interface Story {
  id: string;
  userId: string;
  username?: string;
  mediaUrl: string;
  mediaType: string;
  venueId?: string | null;
  venueName?: string | null;
  createdAt: string;
}

interface StoriesResponse {
  items: Story[];
}

export default function StoryViewerScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();

  const [stories, setStories] = useState<Story[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());

  /* Fetch stories for this user */
  useEffect(() => {
    if (!token || !userId) return;
    (async () => {
      try {
        const data = await socialGet<StoriesResponse>(`/stories/user/${userId}`, token);
        setStories(data.items || []);
      } catch {
        setStories([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, userId]);

  /* Mark current story as viewed */
  const markViewed = useCallback(
    (story: Story) => {
      if (!token) return;
      socialPost(`/stories/${story.id}/view`, {}, token).catch(() => {});
    },
    [token],
  );

  /* Progress timer */
  useEffect(() => {
    if (loading || stories.length === 0) return;

    // Mark current story as viewed
    markViewed(stories[currentIdx]);

    startTimeRef.current = Date.now();
    setProgress(0);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(elapsed / STORY_DURATION, 1);
      setProgress(pct);

      if (pct >= 1) {
        // Auto-advance
        if (currentIdx < stories.length - 1) {
          setCurrentIdx((prev) => prev + 1);
        } else {
          // All stories viewed, go back
          router.back();
        }
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx, loading, stories, markViewed, router]);

  /* Tap handlers */
  const handleTap = (x: number) => {
    if (stories.length === 0) return;
    if (x > SCREEN_W / 2) {
      // Tap right half -> next
      if (currentIdx < stories.length - 1) {
        setCurrentIdx((prev) => prev + 1);
      } else {
        router.back();
      }
    } else {
      // Tap left half -> previous
      if (currentIdx > 0) {
        setCurrentIdx((prev) => prev - 1);
      }
    }
  };

  const currentStory = stories[currentIdx];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.neon} size="large" />
        </View>
      ) : stories.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.noStories}>No stories</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.goBackText}>Go back</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={styles.storyContainer}
          onPress={(e) => handleTap(e.nativeEvent.locationX)}
        >
          {/* Progress bars */}
          <View style={[styles.progressRow, { marginTop: insets.top + 8 }]}>
            {stories.map((s, idx) => (
              <View key={s.id} style={styles.progressSegmentBg}>
                <View
                  style={[
                    styles.progressSegmentFill,
                    {
                      width:
                        idx < currentIdx
                          ? '100%'
                          : idx === currentIdx
                            ? `${progress * 100}%`
                            : '0%',
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          {/* Top bar: close + username */}
          <View style={styles.topBar}>
            <View style={styles.userInfo}>
              <View style={styles.topAvatar}>
                <Text style={{ fontSize: 14 }}>{'\uD83E\uDD89'}</Text>
              </View>
              <Text style={styles.topUsername}>
                {currentStory?.username || 'User'}
              </Text>
            </View>
            <Pressable
              hitSlop={16}
              onPress={() => router.back()}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>{'\u2715'}</Text>
            </Pressable>
          </View>

          {/* Story image */}
          {currentStory?.mediaUrl ? (
            <Image
              source={{ uri: currentStory.mediaUrl }}
              style={styles.storyImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderEmoji}>{'\uD83E\uDD89'}</Text>
            </View>
          )}

          {/* Venue overlay (if any) */}
          {currentStory?.venueName ? (
            <View style={styles.venueOverlay}>
              <Text style={styles.venueOverlayText}>
                {'\uD83D\uDCCD'} {currentStory.venueName}
              </Text>
            </View>
          ) : null}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  noStories: {
    color: colors.inkMute,
    fontSize: 16,
  },
  goBackText: {
    color: colors.neon,
    fontSize: 14,
    fontWeight: '600',
  },
  storyContainer: {
    flex: 1,
  },

  /* Progress bar */
  progressRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: 4,
    zIndex: 10,
  },
  progressSegmentBg: {
    flex: 1,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  progressSegmentFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 1.5,
  },

  /* Top bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topUsername: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '600',
  },

  /* Story image */
  storyImage: {
    flex: 1,
    width: SCREEN_W,
    marginTop: spacing.md,
  },
  placeholderImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 64,
  },

  /* Venue overlay */
  venueOverlay: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  venueOverlayText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
});
