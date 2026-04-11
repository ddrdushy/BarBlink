import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { NeonButton } from '@/components/NeonButton';
import { colors, spacing } from '@/constants/theme';

export default function PhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');

  const valid = phone.replace(/\D/g, '').length >= 9;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.step}>STEP 2 / 4</Text>
        <Text style={styles.title}>Your number</Text>
        <Text style={styles.sub}>
          We'll send you a 6-digit code. Used only for sign-in — never shared.
        </Text>
      </View>

      <View style={styles.field}>
        <View style={styles.prefix}>
          <Text style={styles.prefixText}>🇲🇾 +60</Text>
        </View>
        <TextInput
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
          placeholder="12 345 6789"
          placeholderTextColor={colors.inkFaint}
          keyboardType="phone-pad"
          maxLength={11}
          style={styles.input}
        />
      </View>

      <View style={{ flex: 1 }} />

      <NeonButton
        label="Send code"
        onPress={() => router.push({ pathname: '/(auth)/otp', params: { phone } })}
        disabled={!valid}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.xxl, gap: spacing.md },
  step: { color: colors.neonBright, fontSize: 11, fontWeight: '700', letterSpacing: 1.4 },
  title: { color: colors.ink, fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  sub: { color: colors.inkMute, fontSize: 15, lineHeight: 22, maxWidth: 340 },
  field: {
    marginTop: spacing.xxl,
    flexDirection: 'row',
    gap: 10,
  },
  prefix: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  prefixText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    flex: 1,
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
