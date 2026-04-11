import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { NeonButton } from '@/components/NeonButton';
import { colors, spacing } from '@/constants/theme';
import { apiPost, ApiError } from '@/lib/api';
import { useAuth, type AuthUser } from '@/context/auth';

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { phone, email, mode } = useLocalSearchParams<{
    phone?: string;
    email?: string;
    mode?: string;
  }>();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const refs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  const onChange = (i: number, v: string) => {
    const clean = v.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const code = digits.join('');
  const valid = code.length === OTP_LENGTH;

  const handleVerify = async () => {
    if (!phone) return;
    setLoading(true);
    setError('');
    try {
      const result = await apiPost<{
        accessToken: string;
        refreshToken: string;
        user: AuthUser;
      }>('/auth/verify-otp', { phone, code });

      await auth.login(result.accessToken, result.refreshToken, result.user);

      if (mode === 'register') {
        router.replace('/(auth)/profile-setup');
      } else {
        router.replace('/(tabs)');
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone || resending) return;
    setResending(true);
    setError('');
    try {
      await apiPost('/auth/send-otp', { phone });
      setDigits(Array(OTP_LENGTH).fill(''));
      refs.current[0]?.focus();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.step}>STEP 4 / 5</Text>
        <Text style={styles.title}>Enter code</Text>
        <Text style={styles.sub}>
          Sent to {email ?? phone ?? ''}.{' '}
          Didn't get it?{' '}
          <Pressable onPress={handleResend} disabled={resending}>
            <Text style={styles.link}>{resending ? 'Sending...' : 'Resend'}</Text>
          </Pressable>
        </Text>
      </View>

      <View style={styles.otpRow}>
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={(r) => {
              refs.current[i] = r;
            }}
            value={d}
            onChangeText={(v) => onChange(i, v)}
            keyboardType="number-pad"
            maxLength={1}
            style={styles.cell}
          />
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={{ flex: 1 }} />

      <NeonButton
        label="Verify"
        disabled={!valid}
        loading={loading}
        onPress={handleVerify}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.xxl, gap: spacing.md },
  step: { color: colors.neonBright, fontSize: 11, fontWeight: '700', letterSpacing: 1.4 },
  title: { color: colors.ink, fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  sub: { color: colors.inkMute, fontSize: 15, lineHeight: 22 },
  link: { color: colors.neonBright, fontWeight: '600' },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginTop: spacing.md,
  },
  otpRow: {
    marginTop: spacing.xxl,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    color: colors.ink,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
});
