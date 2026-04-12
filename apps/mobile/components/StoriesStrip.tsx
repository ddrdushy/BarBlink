import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '@/constants/theme';

interface StoryItem {
  userId: string;
  username?: string;
  avatarUrl?: string | null;
  hasUnviewed: boolean;
  storyCount: number;
  isCheckedIn?: boolean;
}

interface Props {
  stories: StoryItem[];
  onCreateStory: () => void;
}

function StoryAvatar({
  item,
  onPress,
}: {
  item: StoryItem;
  onPress: () => void;
}) {
  const ringColor = item.hasUnviewed ? colors.neon : colors.inkFaint;

  return (
    <Pressable style={styles.item} onPress={onPress}>
      <View style={[styles.ring, { borderColor: ringColor }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>
            {item.avatarUrl ? '' : '\uD83E\uDD89'}
          </Text>
        </View>
        {item.isCheckedIn && <View style={styles.checkedInDot} />}
      </View>
      <Text style={styles.username} numberOfLines={1}>
        {item.username || 'user'}
      </Text>
    </Pressable>
  );
}

export function StoriesStrip({ stories, onCreateStory }: Props) {
  const router = useRouter();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* "You" / Create Story button */}
      <Pressable style={styles.item} onPress={onCreateStory}>
        <View style={[styles.ring, { borderColor: colors.neonBorder }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{'\uD83E\uDD89'}</Text>
          </View>
          <View style={styles.plusBadge}>
            <Text style={styles.plusText}>+</Text>
          </View>
        </View>
        <Text style={styles.username}>You</Text>
      </Pressable>

      {stories.map((item) => (
        <StoryAvatar
          key={item.userId}
          item={item}
          onPress={() => router.push(`/story/${item.userId}`)}
        />
      ))}
    </ScrollView>
  );
}

const AVATAR_SIZE = 66;
const RING_WIDTH = 2.5;
const OUTER_SIZE = AVATAR_SIZE + RING_WIDTH * 2 + 4; // ring + gap

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: 14,
  },
  item: {
    alignItems: 'center',
    width: OUTER_SIZE,
  },
  ring: {
    width: OUTER_SIZE,
    height: OUTER_SIZE,
    borderRadius: OUTER_SIZE / 2,
    borderWidth: RING_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  checkedInDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.live,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  plusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.neon,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  plusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: -1,
  },
  username: {
    color: colors.ink,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    width: OUTER_SIZE,
  },
});
