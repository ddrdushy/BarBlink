import { Pressable, StyleSheet, Text, View, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, touchTarget } from '@/constants/theme';

type Variant = 'primary' | 'ghost';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function NeonButton({ label, onPress, variant = 'primary', disabled, loading, style }: Props) {
  const isPrimary = variant === 'primary';
  const dimmed = disabled || loading;

  return (
    <Pressable
      onPress={dimmed ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        style,
        pressed && !dimmed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
        dimmed && { opacity: 0.5 },
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!dimmed }}
    >
      {isPrimary ? (
        <LinearGradient
          colors={['#C45AFF', '#9A3EE8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}
        >
          <ButtonInner label={label} loading={loading} tone="light" />
        </LinearGradient>
      ) : (
        <View style={[styles.fill, styles.ghost]}>
          <ButtonInner label={label} loading={loading} tone="light" />
        </View>
      )}
    </Pressable>
  );
}

function ButtonInner({ label, loading, tone }: { label: string; loading?: boolean; tone: 'light' | 'dark' }) {
  return (
    <View style={styles.inner}>
      {loading ? <ActivityIndicator color={tone === 'light' ? '#fff' : colors.bg} /> : (
        <Text style={[styles.label, { color: '#fff' }]}>{label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    minHeight: touchTarget,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
    borderRadius: radii.pill,
  },
  ghost: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
