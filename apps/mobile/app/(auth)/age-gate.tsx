import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { NeonButton } from '@/components/NeonButton';
import { colors, spacing } from '@/constants/theme';

function isAtLeast18(day: number, month: number, year: number): boolean {
  if (!day || !month || !year) return false;
  const today = new Date();
  const dob = new Date(year, month - 1, day);
  if (isNaN(dob.getTime())) return false;
  const eighteen = new Date(dob.getFullYear() + 18, dob.getMonth(), dob.getDate());
  return eighteen <= today;
}

export default function AgeGate() {
  const router = useRouter();
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const canContinue = useMemo(
    () => isAtLeast18(parseInt(day, 10), parseInt(month, 10), parseInt(year, 10)),
    [day, month, year],
  );

  const onContinue = () => {
    if (!canContinue) {
      Alert.alert('Sorry', 'Barblink is 18+ only.');
      return;
    }
    const dob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    router.push({ pathname: '/(auth)/phone', params: { mode: 'register', dob } });
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.step}>STEP 1 / 5</Text>
        <Text style={styles.title}>How old are you?</Text>
        <Text style={styles.sub}>
          Barblink is 18+ only. This is a hard gate — under-18s can't proceed.
        </Text>
      </View>

      <View style={styles.dobRow}>
        <DobField value={day} onChange={setDay} placeholder="DD" max={2} />
        <DobField value={month} onChange={setMonth} placeholder="MM" max={2} />
        <DobField value={year} onChange={setYear} placeholder="YYYY" max={4} flex={1.8} />
      </View>

      <View style={{ flex: 1 }} />

      <NeonButton label="Continue" onPress={onContinue} disabled={!canContinue} />
      <Text style={styles.legal}>
        We never share your date of birth. It's only used to verify you're 18+.
      </Text>
    </Screen>
  );
}

function DobField({
  value,
  onChange,
  placeholder,
  max,
  flex = 1,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  max: number;
  flex?: number;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={(t) => onChange(t.replace(/[^0-9]/g, '').slice(0, max))}
      placeholder={placeholder}
      placeholderTextColor={colors.inkFaint}
      keyboardType="number-pad"
      maxLength={max}
      style={[styles.input, { flex }]}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.xxl,
    gap: spacing.md,
  },
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
  dobRow: {
    flexDirection: 'row',
    gap: 10,
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
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  legal: {
    color: colors.inkFaint,
    fontSize: 11,
    textAlign: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
});
