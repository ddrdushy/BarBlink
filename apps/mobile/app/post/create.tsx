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

type PostType = 'photo' | 'drink_rating' | 'poll';

export default function CreatePostScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [postType, setPostType] = useState<PostType>('photo');
  const [caption, setCaption] = useState('');
  const [venue, setVenue] = useState<VenueOption | null>(null);
  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Drink rating fields
  const [drinkName, setDrinkName] = useState('');
  const [drinkRating, setDrinkRating] = useState(0);

  // Poll fields
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

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

  const updatePollOption = (idx: number, text: string) => {
    setPollOptions((prev) => prev.map((o, i) => (i === idx ? text : o)));
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) setPollOptions((prev) => [...prev, '']);
  };

  const removePollOption = (idx: number) => {
    if (pollOptions.length > 2) setPollOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const canPost = () => {
    if (!caption.trim() && postType !== 'poll') return false;
    if (postType === 'drink_rating' && (!drinkName.trim() || drinkRating === 0)) return false;
    if (postType === 'poll') {
      const filled = pollOptions.filter((o) => o.trim());
      if (filled.length < 2) return false;
      if (!caption.trim()) return false;
    }
    return true;
  };

  const handlePost = async () => {
    if (!token || !canPost()) return;
    setLoading(true);
    setError('');
    try {
      const body: Record<string, unknown> = {
        caption: caption.trim(),
        type: postType,
      };
      if (venue) body.venueId = venue.id;
      if (postType === 'photo' && imageUri) {
        const url = await uploadImage(imageUri, token);
        body.mediaUrls = [url];
      }
      if (postType === 'drink_rating') {
        body.drinkName = drinkName.trim();
        body.drinkRating = drinkRating;
      }
      if (postType === 'poll') {
        body.pollOptions = pollOptions.filter((o) => o.trim());
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

      {/* Post type selector */}
      <View style={styles.typeRow}>
        {(['photo', 'drink_rating', 'poll'] as PostType[]).map((t) => (
          <Pressable
            key={t}
            style={[styles.typeChip, postType === t && styles.typeChipActive]}
            onPress={() => setPostType(t)}
          >
            <Text style={[styles.typeChipText, postType === t && styles.typeChipTextActive]}>
              {t === 'photo' ? 'Photo' : t === 'drink_rating' ? 'Drink Rating' : 'Poll'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Photo picker — only for photo type */}
      {postType === 'photo' && (
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
      )}

      {/* Drink rating fields */}
      {postType === 'drink_rating' && (
        <View style={styles.drinkSection}>
          <TextInput
            style={styles.drinkInput}
            value={drinkName}
            onChangeText={setDrinkName}
            placeholder="Drink name"
            placeholderTextColor={colors.inkFaint}
            maxLength={100}
          />
          <View style={styles.starRow}>
            <Text style={styles.starLabel}>Rating:</Text>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setDrinkRating(n)} hitSlop={6}>
                <Text style={[styles.star, n <= drinkRating && styles.starActive]}>
                  {n <= drinkRating ? '\u2605' : '\u2606'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Poll options */}
      {postType === 'poll' && (
        <View style={styles.pollSection}>
          {pollOptions.map((opt, idx) => (
            <View key={idx} style={styles.pollOptionRow}>
              <TextInput
                style={styles.pollInput}
                value={opt}
                onChangeText={(t) => updatePollOption(idx, t)}
                placeholder={`Option ${idx + 1}`}
                placeholderTextColor={colors.inkFaint}
                maxLength={80}
              />
              {pollOptions.length > 2 && (
                <Pressable hitSlop={8} onPress={() => removePollOption(idx)}>
                  <Text style={styles.pollRemove}>{'\u2715'}</Text>
                </Pressable>
              )}
            </View>
          ))}
          {pollOptions.length < 4 && (
            <Pressable style={styles.pollAddBtn} onPress={addPollOption}>
              <Text style={styles.pollAddText}>+ Add option</Text>
            </Pressable>
          )}
        </View>
      )}

      <TextInput
        style={styles.captionInput}
        value={caption}
        onChangeText={setCaption}
        placeholder={postType === 'poll' ? 'Ask a question...' : "What's happening tonight?"}
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
        disabled={!canPost()}
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
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  typeChipActive: {
    backgroundColor: colors.neonGhost,
    borderColor: colors.neonBorder,
  },
  typeChipText: {
    color: colors.inkMute,
    fontSize: 13,
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: colors.neonBright,
  },
  drinkSection: {
    gap: 12,
    marginBottom: spacing.md,
  },
  drinkInput: {
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
    fontSize: 15,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starLabel: {
    color: colors.inkMute,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  star: {
    fontSize: 28,
    color: colors.inkFaint,
  },
  starActive: {
    color: '#FFD700',
  },
  pollSection: {
    gap: 8,
    marginBottom: spacing.md,
  },
  pollOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pollInput: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.ink,
    fontSize: 14,
  },
  pollRemove: {
    color: colors.inkMute,
    fontSize: 14,
    padding: 4,
  },
  pollAddBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  pollAddText: {
    color: colors.neon,
    fontSize: 13,
    fontWeight: '600',
  },
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
