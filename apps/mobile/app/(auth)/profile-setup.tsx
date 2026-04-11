import { useState } from 'react';
import {
  Modal,
  Pressable,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { NeonButton } from '@/components/NeonButton';
import { colors, spacing, touchTarget } from '@/constants/theme';
import { userPost, ApiError } from '@/lib/api';
import { useAuth } from '@/context/auth';

const COUNTRIES = [
  { code: 'MY', flag: '\u{1F1F2}\u{1F1FE}', name: 'Malaysia' },
  { code: 'LK', flag: '\u{1F1F1}\u{1F1F0}', name: 'Sri Lanka' },
];

export default function ProfileSetup() {
  const router = useRouter();
  const { token } = useAuth();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const valid = username.trim().length >= 3 && displayName.trim().length >= 2;

  const handleSubmit = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      await userPost('/users/me', {
        username: username.trim(),
        displayName: displayName.trim(),
        country: country.code,
      }, token);
      router.replace('/(tabs)');
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 409) {
        setError('Username is already taken. Try another.');
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

      <View style={styles.field}>
        <Text style={styles.label}>Country</Text>
        <Pressable
          style={styles.countryPicker}
          onPress={() => setPickerOpen(true)}
        >
          <Text style={styles.countryText}>{country.flag}  {country.name}</Text>
          <Text style={styles.caret}>{'\u25BE'}</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={{ flex: 1 }} />

      <NeonButton
        label="Let's go"
        disabled={!valid}
        loading={loading}
        onPress={handleSubmit}
      />

      <Modal
        visible={pickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={modal.root}>
          <View style={modal.handle} />
          <View style={modal.headerRow}>
            <Text style={modal.title}>Select country</Text>
            <Pressable onPress={() => setPickerOpen(false)} hitSlop={16} style={modal.closeBtn}>
              <Text style={modal.closeText}>{'\u2715'}</Text>
            </Pressable>
          </View>
          <FlatList
            data={COUNTRIES}
            keyExtractor={(c) => c.code}
            ItemSeparatorComponent={() => <View style={modal.sep} />}
            renderItem={({ item }) => (
              <Pressable
                style={[modal.row, item.code === country.code && modal.rowActive]}
                onPress={() => { setCountry(item); setPickerOpen(false); }}
              >
                <Text style={modal.flag}>{item.flag}</Text>
                <Text style={modal.countryName}>{item.name}</Text>
                {item.code === country.code && (
                  <Text style={modal.check}>{'\u2713'}</Text>
                )}
              </Pressable>
            )}
          />
        </View>
      </Modal>
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
  field: { marginTop: spacing.xl, gap: 8 },
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
  at: { color: colors.inkMute, fontSize: 18, fontWeight: '700', marginRight: 4 },
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
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    minHeight: touchTarget,
  },
  countryText: { color: colors.ink, fontSize: 17, fontWeight: '600' },
  caret: { color: colors.inkMute, fontSize: 14 },
  error: { color: colors.danger, fontSize: 13, marginTop: spacing.md },
});

const modal = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: 12 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.inkHint, alignSelf: 'center', marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  title: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bgSurface, justifyContent: 'center', alignItems: 'center' },
  closeText: { color: colors.inkMute, fontSize: 14 },
  sep: { height: 1, backgroundColor: 'rgba(255,255,255,0.04)', marginHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, minHeight: touchTarget, gap: 14 },
  rowActive: { backgroundColor: colors.neonGhost },
  flag: { fontSize: 28 },
  countryName: { color: colors.ink, fontSize: 17, fontWeight: '600', flex: 1 },
  check: { color: colors.neonBright, fontSize: 18, fontWeight: '700' },
});
