import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import { useWishlistStore } from '../../src/hooks/useWishlistStore';
import { colors } from '../../src/constants/colors';

export default function AddItemScreen() {
  const router = useRouter();
  const { addItem, isLoading } = useWishlistStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'url' | 'screenshot'>('url');

  const handlePasteUrl = async () => {
    try {
      const clipboard = await navigator.clipboard.readText();
      if (clipboard) {
        setLink(clipboard);
        await fetchLinkMetadata(clipboard);
      }
    } catch (error) {
      console.log('Clipboard access failed');
    }
  };

  const fetchLinkMetadata = async (url: string) => {
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) return;

      const response = await fetch(`${supabaseUrl}/functions/v1/preview-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      
      if (data.title && !title) setTitle(data.title);
      if (data.description && !description) setDescription(data.description);
      if (data.image && !imageUrl) setImageUrl(data.image);
      if (data.price && !price) setPrice((data.price / 100).toString());
    } catch (error) {
      console.log('Failed to fetch metadata');
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera access is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter an item name');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Required', 'Please enter a valid price');
      return;
    }

    const priceInCents = Math.round(parseFloat(price) * 100);

    const { error } = await addItem({
      title: title.trim(),
      description: description.trim() || undefined,
      link: link.trim() || undefined,
      imageUrl: imageUrl || undefined,
      price: priceInCents,
    });

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Add to Wish Wall</Text>
        <Text style={styles.subtitle}>Paste a link or add a screenshot</Text>
      </View>

      <View style={styles.modeToggle}>
        <Pressable
          style={[styles.modeButton, mode === 'url' && styles.modeButtonActive]}
          onPress={() => setMode('url')}
        >
          <Text style={[styles.modeText, mode === 'url' && styles.modeTextActive]}>
            Link
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, mode === 'screenshot' && styles.modeButtonActive]}
          onPress={() => setMode('screenshot')}
        >
          <Text style={[styles.modeText, mode === 'screenshot' && styles.modeTextActive]}>
            Screenshot
          </Text>
        </Pressable>
      </View>

      {mode === 'url' && (
        <View style={styles.inputGroup}>
          <View style={styles.linkInput}>
            <TextInput
              style={styles.input}
              placeholder="Paste product URL..."
              placeholderTextColor={colors.textSecondary}
              value={link}
              onChangeText={setLink}
              autoCapitalize="none"
              keyboardType="url"
              onBlur={() => link && fetchLinkMetadata(link)}
            />
            <Pressable style={styles.pasteButton} onPress={handlePasteUrl}>
              <Text style={styles.pasteText}>Paste</Text>
            </Pressable>
          </View>
        </View>
      )}

      {mode === 'screenshot' && (
        <View style={styles.imageSection}>
          {imageUrl ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: imageUrl }} style={styles.previewImage} />
              <Pressable
                style={styles.removeImage}
                onPress={() => setImageUrl(null)}
              >
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.imageButtons}>
              <Pressable style={styles.imageButton} onPress={handlePickImage}>
                <Text style={styles.imageButtonIcon}>📷</Text>
                <Text style={styles.imageButtonText}>Choose Photo</Text>
              </Pressable>
              <Pressable style={styles.imageButton} onPress={handleTakePhoto}>
                <Text style={styles.imageButtonIcon}>📸</Text>
                <Text style={styles.imageButtonText}>Take Photo</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Item Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="What do you want?"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Color, size, details..."
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Price *</Text>
        <View style={styles.priceInput}>
          <Text style={styles.currency}>$</Text>
          <TextInput
            style={styles.priceField}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>⏰</Text>
        <Text style={styles.infoText}>
          This item will start a 72-hour cooling-off period. You can add it to Court for friends to vote once it expires.
        </Text>
      </View>

      <Pressable
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.submitText}>
          {isLoading ? 'Adding...' : 'Add to Wish Wall'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  modeTextActive: {
    color: colors.text,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  linkInput: {
    flexDirection: 'row',
    gap: 8,
  },
  pasteButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  pasteText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  imageSection: {
    marginBottom: 20,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
    borderStyle: 'dashed',
  },
  imageButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  imagePreview: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: colors.accent,
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C62828',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  currency: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: 4,
  },
  priceField: {
    flex: 1,
    fontSize: 24,
    color: colors.text,
    paddingVertical: 12,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
});