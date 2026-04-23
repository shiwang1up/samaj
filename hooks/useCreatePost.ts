/**
 * useCreatePost – manages create-post form state + submission.
 *
 * SRP : only responsible for post creation form state.
 * DIP : depends on IPostService, injected by the screen.
 */

import { useCallback, useState, useMemo } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageFile, IPostService } from '../services/post/IPostService';

export const MAX_CHARS = 580;

export interface SelectedImage extends ImageFile {
  previewUri: string; // same as uri, kept separate for clarity
}

export const useCreatePost = (postService: IPostService, token: string | null) => {
  const [caption, setCaption]             = useState('');
  const [images, setImages]               = useState<SelectedImage[]>([]);
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  // Decode userId + initial from JWT
  const { userId, userInitial } = useMemo(() => {
      try {
          if (!token) return { userId: '', userInitial: '?' };
          const payload = JSON.parse(atob(token.split('.')[1]));
          return { userId: payload._id ?? '', userInitial: payload.fullName?.[0]?.toUpperCase() ?? 'U' };
      } catch { return { userId: '', userInitial: '?' }; }
  }, [token]);

  const pickImages = useCallback(async () => {
    const remaining = 4 - images.length;
    if (remaining === 0) {
        Alert.alert('Max images', 'You can attach up to 4 images per post.');
        return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo library access in Settings.');
        return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 0.85,
    });

    if (result.canceled) return;

    const picked: SelectedImage[] = result.assets.map((asset) => ({
        uri: asset.uri,
        previewUri: asset.uri,
        name: asset.fileName ?? `image_${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
    }));

    setImages((prev) => {
      const combined = [...prev, ...picked];
      return combined.slice(0, 4); // max 4 images
    });
  }, [images.length]);

  const takePhoto = useCallback(async () => {
    const remaining = 4 - images.length;
    if (remaining === 0) {
        Alert.alert('Max images', 'You can attach up to 4 images per post.');
        return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow camera access in Settings.');
        return;
    }

    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
    });

    if (result.canceled) return;

    const picked: SelectedImage[] = result.assets.map((asset) => ({
        uri: asset.uri,
        previewUri: asset.uri,
        name: asset.fileName ?? `image_${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
    }));

    setImages((prev) => {
      const combined = [...prev, ...picked];
      return combined.slice(0, 4); // max 4 images
    });
  }, [images.length]);

  const removeImage = useCallback((uri: string) => {
    setImages((prev) => prev.filter((img) => img.uri !== uri));
  }, []);

  const canPost = caption.trim().length > 0 || images.length > 0;
  const charsLeft = MAX_CHARS - caption.length;

  const reset = useCallback(() => {
    setCaption('');
    setImages([]);
    setError(null);
  }, []);

  const submit = useCallback(async (): Promise<boolean> => {
    if (!canPost || submitting) return false;
    setSubmitting(true);
    setError(null);
    try {
      await postService.createPost({ userId, caption, images });
      reset();
      return true;
    } catch (err: any) {
      setError(err.message ?? 'Failed to create post. Please try again.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [canPost, submitting, postService, userId, caption, images, reset]);

  return {
    caption, setCaption,
    images, pickImages, removeImage, takePhoto,
    submitting, error,
    canPost, charsLeft,
    submit, reset, userInitial,
  };
};
