import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { NeonButton } from '@/components/NeonButton';
import { colors, spacing } from '@/constants/theme';

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const refs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

  const onChange = (i: number, v: string) => {
    const clean = v.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const code = digits.join('');
  const valid = code.length === OTP_LENGTH;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.step}>STEP 3 / 4</Text>
        <Text style={styles.title}>Enter code</Text>
        <Text style={styles.sub}>
          Sent to +60 {phone ?? ''}. Didn't get it? <Text style={styles.link}>Resend</Text>
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

      <View style={{ flex: 1 }} />

      <NeonButton
        label="Verify"
        disabled={!valid}
        onPress={() => router.push('/(auth)/profile-setup')}
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
