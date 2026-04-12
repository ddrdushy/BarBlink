import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@/constants/theme';

type CrowdStatus = 'quiet' | 'lively' | 'packed';

interface Checkin {
  id: string;
  userId: string;
  username: string;
  venueName: string;
  crowdStatus: CrowdStatus;
}

interface Props {
  checkin: Checkin;
  onReact: (id: string, emoji: string) => void;
}

const crowdColors: Record<CrowdStatus, string> = {
  quiet: colors.crowdQuiet,
  lively: colors.crowdLively,
  packed: colors.crowdPacked,
};

const crowdLabels: Record<CrowdStatus, string> = {
  quiet: 'Quiet',
  lively: 'Lively',
  packed: 'Packed',
};

export function CheckinCard({ checkin, onReact }: Props) {
  const dotColor = crowdColors[checkin.crowdStatus] || colors.crowdQuiet;
  const label = crowdLabels[checkin.crowdStatus] || 'Quiet';

  return (
    <View style={styles.card}>
      {/* Top row: avatar + "username is at" */}
      <View style={styles.topRow}>
        <View style={styles.miniAvatar}>
          <Text style={styles.miniAvatarEmoji}>{'\uD83E\uDD89'}</Text>
        </View>
        <Text style={styles.topText} numberOfLines={1}>
          <Text style={styles.usernameText}>{checkin.username}</Text>
          {' is at'}
        </Text>
      </View>

      {/* Venue name */}
      <Text style={styles.venueName} numberOfLines={2}>
        {checkin.venueName}
      </Text>

      {/* Bottom: crowd status + react button */}
      <View style={styles.bottomRow}>
        <View style={styles.crowdRow}>
          <View style={[styles.crowdDot, { backgroundColor: dotColor }]} />
          <Text style={styles.crowdText}>{label}</Text>
        </View>
        <Pressable
          hitSlop={8}
          onPress={() => onReact(checkin.id, '\uD83D\uDD25')}
          style={styles.reactBtn}
        >
          <Text style={styles.reactEmoji}>{'\uD83D\uDD25'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.neonBorder,
    padding: 14,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarEmoji: {
    fontSize: 10,
  },
  topText: {
    color: colors.inkMute,
    fontSize: 11,
    flex: 1,
  },
  usernameText: {
    fontWeight: '600',
    color: colors.inkMute,
  },
  venueName: {
    color: colors.neon,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  crowdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  crowdDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  crowdText: {
    color: colors.inkMute,
    fontSize: 11,
  },
  reactBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactEmoji: {
    fontSize: 14,
  },
});
