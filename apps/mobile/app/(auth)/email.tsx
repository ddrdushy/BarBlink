import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { NeonButton } from '@/components/NeonButton';
import { colors, spacing } from '@/constants/theme';
import { apiPost, ApiError } from '@/lib/api';

export default function EmailScreen() {
  const router = useRouter();
  const { phone, dob } = useLocalSearchParams<{ phone: string; dob?: string }>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendCode = async () => {
    setLoading(true);
    setError('');
    try {
      await apiPost('/auth/register', {
        phone,
        email,
        dateOfBirth: dob || '',
      });
      router.push({
        pathname: '/(auth)/otp',
        params: { phone, email, mode: 'register' },
      });
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 409) {
        setError('This phone is already registered. Try logging in instead.');
      } else {
        setError(e instanceof ApiError ? e.message : 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

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

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={{ flex: 1 }} />

      <NeonButton
        label="Send code"
        onPress={handleSendCode}
        disabled={!valid}
        loading={loading}
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
  error: {
    color: colors.danger,
    fontSize: 13,
    marginTop: spacing.md,
  },
});
