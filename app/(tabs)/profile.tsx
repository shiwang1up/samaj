import React, { useEffect, useState, useCallback } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import * as ImagePicker from 'expo-image-picker';
import { Config } from '../../constants/Config';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { UserService } from '../../services/user/UserService';

const userService = new UserService();

export default function ProfileScreen() {
    const { theme } = useUnistyles();
    const { user } = useAuth();
    const { profile, loading, error, fetchProfile, updateProfile, updateProfilePicture } = useProfile(userService);

    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editName, setEditName] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editImageUri, setEditImageUri] = useState<string | null>(null);
    const [editImageFile, setEditImageFile] = useState<{ uri: string; name: string; type: string } | null>(null);

    // Initial fetch
    useEffect(() => {
        if (user?._id) {
            fetchProfile(user._id);
        }
    }, [user?._id, fetchProfile]);

    // Setup edit modal — falls back to auth user so the button is never blocked
    const handleOpenEdit = useCallback(() => {
        setEditName(profile?.fullName || user?.fullName || '');
        setEditBio(profile?.bio || '');
        setEditImageUri(null);
        setEditImageFile(null);
        setEditModalVisible(true);
    }, [profile, user]);

    const handlePickImage = useCallback(async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'We need permission to access your photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            setEditImageUri(asset.uri);
            setEditImageFile({
                uri: asset.uri,
                name: asset.fileName ?? `profile_${Date.now()}.jpg`,
                type: asset.mimeType ?? 'image/jpeg',
            });
        }
    }, []);

    const handleSaveProfile = useCallback(async () => {
        if (!user?._id) return;

        try {
            // 1. Update text fields \u2014 userId comes from JWT on the server
            await updateProfile({ fullName: editName, bio: editBio });
            
            // 2. Update profile picture separately if a new one was selected
            if (editImageFile) {
                const formData = new FormData();
                formData.append('profilePicture', editImageFile as any);
                await updateProfilePicture(formData);
            }

            setEditModalVisible(false);
            fetchProfile(user._id); // refresh the data completely
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to update profile');
        }
    }, [user, editName, editBio, editImageFile, updateProfile, updateProfilePicture, fetchProfile]);

    const getProfileImage = useCallback((url?: string) => {
        if (!url) return null;
        if (url.includes('localhost')) return url.replace('localhost', Config.HOST);
        return url;
    }, []);

    if (!user) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>Please login to view profile.</Text>
            </View>
        );
    }

    // ── Initial load: profile not yet fetched ─────────────────
    if (loading && !profile) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading profile…</Text>
            </View>
        );
    }

    // ── Error state with retry ────────────────────────────────
    if (error && !profile) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorEmoji}>⚠️</Text>
                <Text style={styles.errorTitle}>Something went wrong</Text>
                <Text style={styles.errorDesc}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryBtn}
                    onPress={() => fetchProfile(user._id)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.retryBtnText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const imageUri = getProfileImage(profile?.profilePicture);

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchProfile(user._id)} tintColor={theme.colors.primary} />}
            >
                {/* Header Actions */}
                <View style={styles.header}>
                    <Text style={styles.usernameTitle}>@{profile?.username || user.username}</Text>
                    <TouchableOpacity onPress={handleOpenEdit} style={styles.editIconButton}>
                        <Text style={styles.editIconText}>✎</Text>
                    </TouchableOpacity>
                </View>

                {/* Profile Info */}
                <View style={styles.profileSection}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarInitial}>
                                {profile?.fullName?.[0]?.toUpperCase() ?? user.fullName?.[0]?.toUpperCase() ?? '?'}
                            </Text>
                        </View>
                    )}

                    <Text style={styles.fullName}>{profile?.fullName || user.fullName}</Text>
                    {profile?.bio ? (
                        <Text style={styles.bio}>{profile.bio}</Text>
                    ) : (
                        <Text style={styles.bioEmpty}>No bio provided.</Text>
                    )}

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profile?.posts?.length ?? 0}</Text>
                            <Text style={styles.statLabel}>Posts</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profile?.followers?.length ?? 0}</Text>
                            <Text style={styles.statLabel}>Followers</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profile?.following?.length ?? 0}</Text>
                            <Text style={styles.statLabel}>Following</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal visible={isEditModalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Edit Profile</Text>
                        <TouchableOpacity onPress={handleSaveProfile} disabled={loading}>
                            {loading ? (
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                            ) : (
                                <Text style={styles.modalSaveText}>Save</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
                        <View style={styles.editAvatarSection}>
                            <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
                                {editImageUri ? (
                                    <Image source={{ uri: editImageUri }} style={styles.editAvatar} />
                                ) : imageUri ? (
                                    <Image source={{ uri: imageUri }} style={styles.editAvatar} />
                                ) : (
                                    <View style={[styles.editAvatar, styles.avatarPlaceholder]}>
                                        <Text style={styles.avatarInitial}>
                                            {editName?.[0]?.toUpperCase() ?? '?'}
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.editAvatarBadge}>
                                    <Text style={styles.editAvatarBadgeText}>📷</Text>
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.editAvatarHelper}>Tap to change</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Name</Text>
                            <TextInput
                                style={styles.textInput}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder="Your full name"
                                placeholderTextColor={theme.colors.outline}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Bio</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                value={editBio}
                                onChangeText={setEditBio}
                                placeholder="Write something about yourself..."
                                placeholderTextColor={theme.colors.outline}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        gap: theme.spacing.sm,
    },
    emptyText: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_lg,
        color: theme.colors.on_surface_variant,
    },
    loadingText: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_sm,
        color: theme.colors.on_surface_variant,
        marginTop: theme.spacing.sm,
    },
    errorEmoji: {
        fontSize: 40,
    },
    errorTitle: {
        fontFamily: theme.typography.fonts.display,
        fontSize: theme.typography.sizes.title_lg,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.on_surface,
    },
    errorDesc: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_sm,
        color: theme.colors.on_surface_variant,
        textAlign: 'center',
        paddingHorizontal: theme.spacing['2xl'],
    },
    retryBtn: {
        marginTop: theme.spacing.md,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radius.full,
    },
    retryBtnText: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_md,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.on_primary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: 60,
        paddingBottom: theme.spacing.md,
    },
    usernameTitle: {
        fontFamily: theme.typography.fonts.display,
        fontSize: theme.typography.sizes.title_lg,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.on_surface,
    },
    editIconButton: {
        padding: theme.spacing.sm,
        backgroundColor: theme.colors.surface_container_low,
        borderRadius: theme.radius.full,
    },
    editIconText: {
        fontSize: 18,
        color: theme.colors.primary,
    },
    profileSection: {
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.base,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: theme.radius.full,
        marginBottom: theme.spacing.md,
    },
    avatarPlaceholder: {
        backgroundColor: theme.colors.secondary_container,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontFamily: theme.typography.fonts.display,
        fontSize: theme.typography.sizes.display_sm,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.on_secondary_container,
    },
    fullName: {
        fontFamily: theme.typography.fonts.display,
        fontSize: theme.typography.sizes.headline_sm,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.on_surface,
        marginBottom: theme.spacing.xs,
    },
    bio: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_md,
        color: theme.colors.on_surface_variant,
        textAlign: 'center',
        paddingHorizontal: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
        lineHeight: theme.typography.sizes.body_md * theme.typography.leading.body,
    },
    bioEmpty: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_sm,
        color: theme.colors.outline,
        fontStyle: 'italic',
        marginBottom: theme.spacing.xl,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface_container_lowest,
        borderRadius: theme.radius.xl,
        paddingVertical: theme.spacing.base,
        paddingHorizontal: theme.spacing.lg,
        borderWidth: theme.ghostBorder.borderWidth,
        borderColor: theme.ghostBorder.borderColor,
        ...theme.elevation[1],
        width: '100%',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: theme.colors.outline_variant,
        opacity: 0.5,
    },
    statValue: {
        fontFamily: theme.typography.fonts.display,
        fontSize: theme.typography.sizes.title_lg,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.on_surface,
    },
    statLabel: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_sm,
        color: theme.colors.on_surface_variant,
        marginTop: 2,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.base,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.surface_container_high,
    },
    modalTitle: {
        fontFamily: theme.typography.fonts.display,
        fontSize: theme.typography.sizes.title_md,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.on_surface,
    },
    modalCancelText: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_md,
        color: theme.colors.outline,
    },
    modalSaveText: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_md,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.primary,
    },
    modalBody: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.xl,
    },
    editAvatarSection: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    editAvatar: {
        width: 120,
        height: 120,
        borderRadius: theme.radius.full,
    },
    editAvatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.primary_container,
        borderRadius: theme.radius.full,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: theme.colors.background,
    },
    editAvatarBadgeText: {
        fontSize: 16,
    },
    editAvatarHelper: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_sm,
        color: theme.colors.outline,
        marginTop: theme.spacing.sm,
    },
    inputGroup: {
        marginBottom: theme.spacing.lg,
    },
    inputLabel: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_md,
        fontWeight: theme.typography.weights.medium,
        color: theme.colors.on_surface_variant,
        marginBottom: theme.spacing.xs,
    },
    textInput: {
        backgroundColor: theme.colors.surface_container_low,
        borderRadius: theme.radius.md,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.base,
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_lg,
        color: theme.colors.on_surface,
        borderWidth: theme.ghostBorder.borderWidth,
        borderColor: theme.ghostBorder.borderColor,
    },
    textArea: {
        minHeight: 100,
    },
}));
