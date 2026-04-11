import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { NeonButton } from '@/components/NeonButton';
import { Logo } from '@/components/Logo';
import { colors, spacing } from '@/constants/theme';

export default function Welcome() {
  const router = useRouter();

  return (
    <Screen>
      <LinearGradient
        colors={['rgba(196,90,255,0.18)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.topRow}>
        <Logo size="sm" />
      </View>

      <View style={styles.hero}>
        <View style={styles.badge}>
          <View style={styles.liveDot} />
          <Text style={styles.badgeText}>LIVE IN KL & COLOMBO</Text>
        </View>
        <Text style={styles.headline}>
          Your night starts{'\n'}with a <Text style={styles.accent}>Blink</Text>.
        </Text>
        <Text style={styles.sub}>
          Discover bars, follow your favourite DJs, and track your crew —
          before you leave the house.
        </Text>
      </View>

      <View style={styles.actions}>
        <NeonButton
          label="Get started"
          onPress={() => router.push({ pathname: '/(auth)/age-gate', params: { mode: 'register' } })}
        />
        <NeonButton
          label="I already have an account"
          variant="ghost"
          onPress={() => router.push({ pathname: '/(auth)/phone', params: { mode: 'login' } })}
        />
      </View>

      <Text style={styles.legal}>
        By continuing you agree to the Terms of Service and Privacy Policy. 18+ only.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    paddingTop: spacing.lg,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(196,90,255,0.25)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.live,
  },
  badgeText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  headline: {
    color: colors.ink,
    fontSize: 46,
    fontWeight: '800',
    letterSpacing: -1.2,
    lineHeight: 48,
  },
  accent: { color: colors.neon },
  sub: {
    color: colors.inkMute,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 360,
  },
  actions: {
    gap: 12,
    paddingBottom: spacing.lg,
  },
  legal: {
    color: colors.inkFaint,
    fontSize: 11,
    textAlign: 'center',
    paddingBottom: spacing.lg,
  },
});
