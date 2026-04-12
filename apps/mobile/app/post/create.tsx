import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '@/components/Screen';
import { NeonButton } from '@/components/NeonButton';
import { colors, radii, spacing, touchTarget } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { socialPost, venueGet, userGet, uploadImage } from '@/lib/api';

interface VenueOption {
  id: string;
  name: string;
  area: string | null;
}

export default function CreatePostScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [caption, setCaption] = useState('');
  const [venue, setVenue] = useState<VenueOption | null>(null);
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const profile = await userGet<{ country: string }>('/users/me', token);
        const data = await venueGet<{ items: VenueOption[] }>(`/venues?country=${profile.country}&limit=50`);
        setVenues(data.items);
      } catch { /* silent */ }
    })();
  }, [token]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!token || !caption.trim()) return;
    setLoading(true);
    setError('');
    try {
      const body: Record<string, unknown> = { caption: caption.trim() };
      if (venue) body.venueId = venue.id;
      if (imageUri) {
        const url = await uploadImage(imageUri, token);
        body.mediaUrls = [url];
      }
      await socialPost('/posts', body, token);
      router.back();
    } catch (e: any) {
      setError(e?.message || 'Failed to post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Text style={styles.title}>New Post</Text>
        <View style={{ width: 60 }} />
      </View>

      <Pressable style={styles.photoBtn} onPress={pickImage}>
        {imageUri ? (
          <View style={styles.photoPreviewRow}>
            <Image source={{ uri: imageUri }} style={styles.photoThumb} />
            <Text style={styles.photoBtnText}>Change Photo</Text>
            <Pressable hitSlop={12} onPress={() => setImageUri(null)}>
              <Text style={styles.photoRemove}>{'\u2715'}</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.photoBtnText}>{'\uD83D\uDCF7'} Add Photo</Text>
        )}
      </Pressable>

      <TextInput
        style={styles.captionInput}
        value={caption}
        onChangeText={setCaption}
        placeholder="What's happening tonight?"
        placeholderTextColor={colors.inkFaint}
        multiline
        maxLength={500}
        autoFocus
      />

      <Pressable style={styles.venuePicker} onPress={() => setPickerOpen(true)}>
        <Text style={styles.venuePickerText}>
          {venue ? `📍 ${venue.name}` : '📍 Tag a venue (optional)'}
        </Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={{ flex: 1 }} />

      <NeonButton
        label="Post"
        onPress={handlePost}
        disabled={!caption.trim()}
        loading={loading}
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
            <Text style={modal.title}>Tag a venue</Text>
            <Pressable onPress={() => setPickerOpen(false)} hitSlop={16} style={modal.closeBtn}>
              <Text style={modal.closeText}>{'\u2715'}</Text>
            </Pressable>
          </View>
          <FlatList
            data={venues}
            keyExtractor={(v) => v.id}
            ItemSeparatorComponent={() => <View style={modal.sep} />}
            renderItem={({ item }) => (
              <Pressable
                style={[modal.row, venue?.id === item.id && modal.rowActive]}
                onPress={() => { setVenue(item); setPickerOpen(false); }}
              >
                <Text style={modal.venueName}>{item.name}</Text>
                {item.area && <Text style={modal.venueArea}>{item.area.replace(/_/g, ' ')}</Text>}
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: spacing.lg },
  cancel: { color: colors.inkMute, fontSize: 15, fontWeight: '600' },
  title: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  photoBtn: {
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neonBorder,
    borderStyle: 'dashed',
    padding: 14,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  photoBtnText: { color: colors.neon, fontSize: 14, fontWeight: '600' },
  photoPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  photoThumb: { width: 100, height: 100, borderRadius: 8 },
  photoRemove: { color: colors.inkMute, fontSize: 14, padding: 4 },
  captionInput: {
    color: colors.ink,
    fontSize: 17,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  venuePicker: {
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginTop: spacing.md,
  },
  venuePickerText: { color: colors.inkMute, fontSize: 14 },
  error: { color: colors.danger, fontSize: 13, marginTop: spacing.sm },
});

const modal = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: 12 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.inkHint, alignSelf: 'center', marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  title: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bgSurface, justifyContent: 'center', alignItems: 'center' },
  closeText: { color: colors.inkMute, fontSize: 14 },
  sep: { height: 1, backgroundColor: 'rgba(255,255,255,0.04)', marginHorizontal: 20 },
  row: { paddingHorizontal: 20, paddingVertical: 14, minHeight: touchTarget, flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowActive: { backgroundColor: colors.neonGhost },
  venueName: { color: colors.ink, fontSize: 15, fontWeight: '600', flex: 1 },
  venueArea: { color: colors.inkMute, fontSize: 12, textTransform: 'capitalize' },
});
