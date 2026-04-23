/**
 * CreatePostScreen – Twitter-style post compose screen.
 *
 * Features:
 *  - Auto-growing rich text input ("What's happening in your colony?")
 *  - Multi-image picker (up to 4 images) with 2-col preview grid + remove
 *  - Character counter that goes red when approaching limit
 *  - Optimistic "Post" button (active when text OR images present)
 *  - Success haptic + feed-refetch callback on post
 *
 * SRP : UI only — business logic in useCreatePost.
 * DIP : PostService injected at composition root.
 */

import { Ionicons }           from '@expo/vector-icons';
import * as Haptics           from 'expo-haptics';
import { useRouter }          from 'expo-router';
import React, { useCallback, useRef } from 'react';
import {
    ActivityIndicator,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
}                             from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useAuth }            from '../../hooks/useAuth';
import { useCreatePost, MAX_CHARS, SelectedImage } from '../../hooks/useCreatePost';
import { Config }             from '../../constants/Config';
import { PostService }        from '../../services/post/PostService';

// ── Composition root ──────────────────────────────────────────
const postService = new PostService();

// ── Avatar URL helper (for post images and user avatar) ────────
const resolveUrl = (url: string | undefined) => {
    if (!url) return null;
    return url.includes('localhost') ? url.replace('localhost', Config.HOST) : url;
};

// ── CharRing ─────────────────────────────────────────────────
// Shows remaining chars — matches Twitter's circular counter
function CharRing({ charsLeft }: { charsLeft: number }) {
    const { theme } = useUnistyles();
    const used   = MAX_CHARS - charsLeft;
    const pct    = Math.min(used / MAX_CHARS, 1);
    const danger = charsLeft <= 20;
    const warn   = charsLeft <= 60;

    const ringColor = danger
        ? theme.colors.error
        : warn
        ? theme.colors.error_container
        : theme.colors.primary;

    if (charsLeft > 100) return null; // invisible until ~80% full

    return (
        <View style={charStyles.wrap}>
            <Text style={[charStyles.text, { color: danger ? theme.colors.error : theme.colors.on_surface_variant }]}>
                {charsLeft}
            </Text>
        </View>
    );
}

const charStyles = StyleSheet.create((theme) => ({
    wrap: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 32,
    },
    text: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_sm,
        fontWeight: theme.typography.weights.semibold,
    },
}));

// ── ImageGrid ─────────────────────────────────────────────────
interface ImageGridProps {
    images: SelectedImage[];
    onRemove: (uri: string) => void;
}

function ImageGrid({ images, onRemove }: ImageGridProps) {
    const { theme } = useUnistyles();
    if (images.length === 0) return null;

    return (
        <View style={gridStyles.grid}>
            {images.map((img, i) => (
                <View
                    key={img.uri}
                    style={[
                        gridStyles.cell,
                        images.length === 1 && gridStyles.singleCell,
                        images.length === 3 && i === 2 && gridStyles.thirdCell,
                    ]}
                >
                    <Image source={{ uri: img.previewUri }} style={gridStyles.image} />
                    <TouchableOpacity
                        style={gridStyles.removeBtn}
                        onPress={() => onRemove(img.uri)}
                        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                    >
                        <Ionicons name="close-circle" size={22} color={theme.colors.surface_container_lowest} />
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
}

const gridStyles = StyleSheet.create((theme) => ({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 2,
        marginTop: theme.spacing.sm,
        borderRadius: theme.radius.xl,
        overflow: 'hidden',
    },
    cell: {
        width: '49.5%',
        aspectRatio: 1,
        position: 'relative',
    },
    singleCell: {
        width: '100%',
        aspectRatio: 16 / 9,
    },
    thirdCell: {
        width: '100%',
        aspectRatio: 2,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeBtn: {
        position: 'absolute',
        top: theme.spacing.sm,
        right: theme.spacing.sm,
        backgroundColor: theme.colors.scrim ?? '#000',
        opacity: 0.6,
        borderRadius: theme.radius.full,
    },
}));

// ── Screen ────────────────────────────────────────────────────
export default function CreatePostScreen() {
    const { theme }     = useUnistyles();
    const { token, user } = useAuth();
    const router        = useRouter();
    const inputRef      = useRef<TextInput>(null);

    const {
        caption, setCaption,
        images, pickImages, removeImage, takePhoto,
        submitting, error,
        canPost, charsLeft,
        submit, reset, userInitial,
    } = useCreatePost(postService, token);

    // ── Post submit ──────────────────────────────────────────
    const handlePost = useCallback(async () => {
        const ok = await submit();
        if (ok) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.navigate('/'); // navigate back to home feed
        }
    }, [submit, router]);

    // ── Render ───────────────────────────────────────────────
    const avatarUri = resolveUrl(user?.profilePicture);

    return (
        <SafeAreaView style={styles.root}>
            {/* ── Header ──────────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={reset} style={styles.cancelBtn} disabled={submitting}>
                    <Text style={styles.cancelText}>Clear</Text>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>New Report</Text>

                <TouchableOpacity
                    style={[styles.postBtn, !canPost && styles.postBtnDisabled]}
                    onPress={handlePost}
                    disabled={!canPost || submitting}
                    activeOpacity={0.8}
                >
                    {submitting ? (
                        <ActivityIndicator size="small" color={theme.colors.surface_container_lowest} />
                    ) : (
                        <Text style={styles.postBtnText}>Post</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* ── Error banner ─────────────────────────────── */}
            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* ── Compose area ─────────────────────────────── */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardDismissMode="interactive"
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.composeRow}>
                    {/* Avatar */}
                    {avatarUri ? (
                        <Image source={{ uri: avatarUri }} style={styles.avatar} resizeMode="cover" />
                    ) : (
                        <View style={[styles.avatar, styles.avatarFallback]}>
                            <Text style={styles.avatarInitial}>{userInitial}</Text>
                        </View>
                    )}

                    {/* Right column: input + images */}
                    <View style={styles.inputColumn}>
                        <TextInput
                            ref={inputRef}
                            style={styles.input}
                            value={caption}
                            onChangeText={(t) => {
                                if (t.length <= MAX_CHARS) setCaption(t);
                            }}
                            placeholder="What's happening in your colony?"
                            placeholderTextColor={theme.colors.outline}
                            multiline
                            autoFocus
                            textAlignVertical="top"
                            maxLength={MAX_CHARS}
                        />

                        {/* Image grid preview */}
                        <ImageGrid images={images} onRemove={removeImage} />
                    </View>
                </View>

            </ScrollView>

            {/* Visibility hint (pinned to bottom above toolbar) */}
            <View style={styles.visibilityRow}>
                <Ionicons name="earth-outline" size={14} color={theme.colors.primary} />
                <Text style={styles.visibilityText}>Everyone can see this</Text>
            </View>

            {/* ── Toolbar ──────────────────────────────────── */}
            <View style={[
                styles.toolbar,
                // { paddingBottom: Platform.OS === 'ios' ? 28 : 12 },
            ]}>
                {/* Image picker */}
                <TouchableOpacity
                    style={styles.toolbarBtn}
                    onPress={pickImages}
                    disabled={images.length >= 4}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="image-outline"
                        size={24}
                        color={images.length >= 4 ? theme.colors.outline : theme.colors.primary}
                    />
                </TouchableOpacity>

                {/* Camera */}
                <TouchableOpacity
                    style={styles.toolbarBtn}
                    activeOpacity={0.7}
                    onPress={takePhoto}
                    disabled={images.length >= 4}
                >
                    <Ionicons
                        name="camera-outline"
                        size={24}
                        color={images.length >= 4 ? theme.colors.outline : theme.colors.primary}
                    />
                </TouchableOpacity>

                {/* Location (future) */}
                <TouchableOpacity style={styles.toolbarBtn} activeOpacity={0.7}>
                    <Ionicons name="location-outline" size={24} color={theme.colors.primary} />
                </TouchableOpacity>

                {/* Spacer + char counter */}
                <View style={styles.toolbarRight}>
                    <CharRing charsLeft={charsLeft} />

                    <View style={styles.toolbarDivider} />

                    {/* Add thread (future) */}
                    <TouchableOpacity style={styles.toolbarBtn} activeOpacity={0.7}>
                        <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create((theme) => ({
    root: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.base,
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: theme.ghostBorder.borderWidth,
        borderBottomColor: theme.ghostBorder.borderColor,
    },
    headerTitle: {
        fontFamily: theme.typography.fonts.display,
        fontSize: theme.typography.sizes.title_sm,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.on_surface,
        letterSpacing: theme.typography.tracking.display,
    },
    cancelBtn: {
        paddingVertical: 4,
        paddingHorizontal: 2,
    },
    cancelText: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_md,
        color: theme.colors.on_surface_variant,
    },
    postBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.base,
        paddingVertical: 7,
        borderRadius: theme.radius.full,
        minWidth: 64,
        alignItems: 'center',
        justifyContent: 'center',
    },
    postBtnDisabled: {
        opacity: 0.4,
    },
    postBtnText: {
        fontFamily: theme.typography.fonts.display,
        fontSize: theme.typography.sizes.label_md,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.surface_container_lowest,
    },

    // Error
    errorBanner: {
        backgroundColor: theme.colors.error_container,
        paddingHorizontal: theme.spacing.base,
        paddingVertical: theme.spacing.sm,
    },
    errorText: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_sm,
        color: theme.colors.on_error_container,
    },

    // Compose
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.base,
        paddingTop: theme.spacing.base,
        paddingBottom: theme.spacing.xl,
    },
    composeRow: {
        flexDirection: 'row',
        gap: theme.spacing.base,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: theme.radius.full,
        flexShrink: 0,
    },
    avatarFallback: {
        backgroundColor: theme.colors.secondary_container,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontFamily: theme.typography.fonts.display,
        fontSize: theme.typography.sizes.title_sm,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.on_secondary_container,
    },
    inputColumn: {
        flex: 1,
    },
    input: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_lg,
        color: theme.colors.on_surface,
        lineHeight: theme.typography.sizes.body_lg * 1.5,
        paddingTop: 8,
        minHeight: 60,
        textAlignVertical: 'top',
    },

    // Visibility
    visibilityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.base,
    },
    visibilityText: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_sm,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.primary,
    },

    // Toolbar
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.sm,
        paddingTop: theme.spacing.sm,
        borderTopWidth: theme.ghostBorder.borderWidth,
        borderTopColor: theme.ghostBorder.borderColor,
    },
    toolbarBtn: {
        padding: 8,
    },
    toolbarRight: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto',
        gap: theme.spacing.xs,
    },
    toolbarDivider: {
        width: 1,
        height: 22,
        backgroundColor: theme.colors.outline_variant,
        marginHorizontal: 4,
    },
}));
