import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { NeonButton } from '@/components/NeonButton';
import { colors, spacing } from '@/constants/theme';

export default function EmailScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [email, setEmail] = useState('');

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.step}>STEP 3 / 5</Text>
        <Text style={styles.title}>Your email</Text>
        <Text style={styles.sub}>
          We'll send your verification code here. Used only for sign-in.
        </Text>
      </View>

      <View style={styles.fieldWrap}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.inkFaint}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          style={styles.input}
        />
      </View>

      <View style={{ flex: 1 }} />

      <NeonButton
        label="Send code"
        onPress={() =>
          router.push({
            pathname: '/(auth)/otp',
            params: { phone, email },
          })
        }
        disabled={!valid}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.xxl, gap: spacing.md },
  step: {
    color: colors.neonBright,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  title: {
    color: colors.ink,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  sub: {
    color: colors.inkMute,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 340,
  },
  fieldWrap: {
    marginTop: spacing.xxl,
  },
  input: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    color: colors.ink,
    fontSize: 18,
    fontWeight: '600',
  },
});
