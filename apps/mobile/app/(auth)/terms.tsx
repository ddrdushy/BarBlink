import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { NeonButton } from '@/components/NeonButton';
import { colors, spacing } from '@/constants/theme';

export default function TermsScreen() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Terms & Privacy</Text>
        <Text style={styles.sub}>
          Please review and accept before continuing.
        </Text>
      </View>

      <ScrollView style={styles.scrollBox} showsVerticalScrollIndicator>
        <Text style={styles.sectionTitle}>Terms of Service</Text>
        <Text style={styles.body}>
          By using Barblink, you agree to the following terms:{'\n\n'}
          1. You confirm you are 18 years of age or older.{'\n\n'}
          2. You will not use Barblink to harass, bully, or threaten other users.{'\n\n'}
          3. Content you post (photos, check-ins, comments) must comply with local laws and community guidelines.{'\n\n'}
          4. Barblink may remove content or suspend accounts that violate these terms.{'\n\n'}
          5. Venue data is provided for informational purposes. Barblink is not responsible for venue operations, pricing, or safety.
        </Text>

        <Text style={styles.sectionTitle}>Privacy Policy</Text>
        <Text style={styles.body}>
          Your privacy matters to us:{'\n\n'}
          1. We collect your phone number and email for authentication only.{'\n\n'}
          2. Location data is used only for check-ins and nearby venue discovery. It is never sold to third parties.{'\n\n'}
          3. Your profile, check-in history, and posts are visible to other Barblink users unless you change your privacy settings.{'\n\n'}
          4. We use cookies and analytics to improve the app experience.{'\n\n'}
          5. You can request deletion of your account and data at any time by contacting support@barblink.com.
        </Text>
      </ScrollView>

      <Pressable
        style={styles.checkRow}
        onPress={() => setAccepted(!accepted)}
      >
        <View style={[styles.checkbox, accepted && styles.checkboxActive]}>
          {accepted && <Text style={styles.checkmark}>{'\u2713'}</Text>}
        </View>
        <Text style={styles.checkLabel}>
          I agree to the Terms of Service and Privacy Policy
        </Text>
      </Pressable>

      <NeonButton
        label="Continue"
        disabled={!accepted}
        onPress={() => router.replace('/(tabs)')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.xxl, gap: spacing.sm, marginBottom: spacing.lg },
  title: { color: colors.ink, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  sub: { color: colors.inkMute, fontSize: 14 },
  scrollBox: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.neonBright,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  body: { color: colors.inkMute, fontSize: 13, lineHeight: 20 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.inkFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    borderColor: colors.neon,
    backgroundColor: colors.neonGhost,
  },
  checkmark: { color: colors.neon, fontSize: 14, fontWeight: '700' },
  checkLabel: { color: colors.ink, fontSize: 13, flex: 1 },
});
