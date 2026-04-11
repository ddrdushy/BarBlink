import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/theme';

type Props = {
  size?: 'sm' | 'md' | 'lg';
};

const sizes = {
  sm: { wordmark: 18, icon: 28, icoText: 14 },
  md: { wordmark: 24, icon: 36, icoText: 18 },
  lg: { wordmark: 36, icon: 56, icoText: 28 },
};

export function Logo({ size = 'md' }: Props) {
  const s = sizes[size];
  return (
    <View style={styles.row}>
      <LinearGradient
        colors={['#C45AFF', '#7A2BBE']}
        style={[styles.icon, { width: s.icon, height: s.icon, borderRadius: s.icon / 2 }]}
      >
        <Text style={{ fontSize: s.icoText }}>🦉</Text>
      </LinearGradient>
      <Text style={[styles.wordmark, { fontSize: s.wordmark }]}>
        BAR<Text style={styles.accent}>LINK</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    color: colors.ink,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  accent: {
    color: colors.neon,
  },
});
