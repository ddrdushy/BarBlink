import { useEffect } from 'react';
import { StyleSheet, View, Text, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Logo } from '@/components/Logo';
import { colors } from '@/constants/theme';

export default function Splash() {
  const router = useRouter();
  const glow = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();

    const t = setTimeout(() => router.replace('/(auth)/welcome'), 1600);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(196,90,255,0.18)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={{
          opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }),
          transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1.02] }) }],
        }}
      >
        <Logo size="lg" />
      </Animated.View>
      <Text style={styles.tagline}>Blink, You're In.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  tagline: {
    color: colors.inkMute,
    fontSize: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
});
