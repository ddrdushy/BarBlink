import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { NeonButton } from '@/components/NeonButton';
import { colors, spacing, touchTarget } from '@/constants/theme';
import {
  ALL_COUNTRIES,
  PRIORITY_COUNTRIES,
  type DialCountry,
} from '@/constants/dialCodes';

export default function PhoneScreen() {
  const router = useRouter();
  const [country, setCountry] = useState<DialCountry>(PRIORITY_COUNTRIES[0]);
  const [localNumber, setLocalNumber] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const fullPhone = `${country.dialCode}${localNumber}`;
  const valid = localNumber.replace(/\D/g, '').length >= 7;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.step}>STEP 2 / 5</Text>
        <Text style={styles.title}>Your number</Text>
        <Text style={styles.sub}>
          We'll send you a 6-digit code. Used only for sign-in — never shared.
        </Text>
      </View>

      <View style={styles.field}>
        <TouchableOpacity
          style={styles.prefix}
          onPress={() => setPickerOpen(true)}
          activeOpacity={0.7}
          accessibilityLabel={`Country code ${country.dialCode}. Tap to change.`}
        >
          <Text style={styles.prefixText}>
            {country.flag} {country.dialCode}
          </Text>
          <Text style={styles.caret}>{'\u25BE'}</Text>
        </TouchableOpacity>

        <TextInput
          value={localNumber}
          onChangeText={(t) => setLocalNumber(t.replace(/[^0-9]/g, ''))}
          placeholder="12 345 6789"
          placeholderTextColor={colors.inkFaint}
          keyboardType="phone-pad"
          maxLength={country.maxLocalDigits}
          style={styles.input}
        />
      </View>

      <View style={{ flex: 1 }} />

      <NeonButton
        label="Continue"
        onPress={() =>
          router.push({ pathname: '/(auth)/email', params: { phone: fullPhone } })
        }
        disabled={!valid}
      />

      <Modal
        visible={pickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={sheet.root}>
          <View style={sheet.handle} />
          <View style={sheet.headerRow}>
            <Text style={sheet.title}>Select country</Text>
            <Pressable
              onPress={() => setPickerOpen(false)}
              hitSlop={16}
              style={sheet.closeBtn}
            >
              <Text style={sheet.closeText}>{'\u2715'}</Text>
            </Pressable>
          </View>

          <FlatList
            data={ALL_COUNTRIES}
            keyExtractor={(c) => c.code}
            ItemSeparatorComponent={() => <View style={sheet.sep} />}
            renderItem={({ item, index }) => (
              <>
                {index === PRIORITY_COUNTRIES.length && (
                  <View style={sheet.divider} />
                )}
                <Pressable
                  style={[
                    sheet.row,
                    item.code === country.code && sheet.rowActive,
                  ]}
                  onPress={() => {
                    setCountry(item);
                    setLocalNumber('');
                    setPickerOpen(false);
                  }}
                >
                  <Text style={sheet.flag}>{item.flag}</Text>
                  <Text style={sheet.countryName}>{item.name}</Text>
                  <Text style={sheet.dialCode}>{item.dialCode}</Text>
                  {item.code === country.code && (
                    <Text style={sheet.check}>{'\u2713'}</Text>
                  )}
                </Pressable>
              </>
            )}
          />
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: touchTarget,
  },
  prefixText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  caret: {
    color: colors.inkMute,
    fontSize: 12,
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

const sheet = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.inkHint,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: colors.inkMute,
    fontSize: 14,
  },
  sep: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginHorizontal: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neonBorder,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: touchTarget,
    gap: 12,
  },
  rowActive: {
    backgroundColor: colors.neonGhost,
  },
  flag: {
    fontSize: 24,
  },
  countryName: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '600',
  },
  dialCode: {
    color: colors.inkMute,
    fontSize: 14,
    marginLeft: 'auto',
  },
  check: {
    color: colors.neonBright,
    fontSize: 16,
    fontWeight: '700',
  },
});
