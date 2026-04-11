import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen } from '@/components/Screen';
import { NeonButton } from '@/components/NeonButton';
import { colors, spacing } from '@/constants/theme';

export default function ProfileSetup() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');

  const valid = username.trim().length >= 3 && displayName.trim().length >= 2;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.step}>STEP 5 / 5</Text>
        <Text style={styles.title}>Set up profile</Text>
        <Text style={styles.sub}>
          This is what your crew will see when you check in. Pick a username
          you'll answer to at the bar.
        </Text>
      </View>

      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>🦉</Text>
        </View>
        <Text style={styles.avatarHint}>Tap to upload{'\n'}(optional)</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Username</Text>
        <View style={styles.inputWrap}>
          <Text style={styles.at}>@</Text>
          <TextInput
            value={username}
            onChangeText={(v) => setUsername(v.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
            placeholder="owl_kl"
            placeholderTextColor={colors.inkFaint}
            maxLength={24}
            style={styles.input}
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Display name</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Marcus"
          placeholderTextColor={colors.inkFaint}
          maxLength={32}
          style={[styles.input, styles.fullInput]}
        />
      </View>

      <View style={{ flex: 1 }} />

      <NeonButton
        label="Let's go"
        disabled={!valid}
        onPress={async () => {
          // Temp-store profile data for when user-service is built
          await AsyncStorage.setItem('bbk_profile_draft', JSON.stringify({ username, displayName }));
          router.replace('/(tabs)');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.xxl, gap: spacing.md },
  step: { color: colors.neonBright, fontSize: 11, fontWeight: '700', letterSpacing: 1.4 },
  title: { color: colors.ink, fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  sub: { color: colors.inkMute, fontSize: 15, lineHeight: 22 },
  avatarRow: {
    marginTop: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.neonBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 36 },
  avatarHint: { color: colors.inkMute, fontSize: 13 },
  field: {
    marginTop: spacing.xl,
    gap: 8,
  },
  label: {
    color: colors.inkMute,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 18,
  },
  at: {
    color: colors.inkMute,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    color: colors.ink,
    fontSize: 17,
    fontWeight: '600',
  },
  fullInput: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 18,
  },
});
