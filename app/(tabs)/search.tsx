import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useUnistyles, StyleSheet } from 'react-native-unistyles';
import { Config } from '../../constants/Config';
import { useAuth } from '../../hooks/useAuth';
import { useSearchUsers } from '../../hooks/useSearchUsers';
import { UserService } from '../../services/user/UserService';
import { User } from '../../services/user/IUserService';

// ── Composition root: one stable instance per screen mount ────
const userService = new UserService();

export default function SearchScreen() {
    const { theme } = useUnistyles();

    // DIP: hook receives the service, not "new UserService()" inside
    const { user } = useAuth();
    const { searchUsers, users, setUsers, loading, error } = useSearchUsers(userService);
    const [query, setQuery] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Debounced API search — no local filtering ──────────────
    const handleSearch = useCallback(
        (text: string) => {
            setQuery(text);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                searchUsers(text);            // token injected by interceptor
            }, 500);
        },
        [searchUsers],
    );

    // ── Helpers ───────────────────────────────────────────────
    const getProfileImage = useCallback((url: string) => {
        if (!url) return null;
        if (url.includes('localhost')) return url.replace('localhost', Config.HOST);
        return url;
    }, []);

    const handleFollowToggle = useCallback(async (targetUser: User) => {
        if (!user) return;
        const isFollowing = targetUser.followers?.includes(user._id);

        // Optimistic update
        setUsers(prevUsers => prevUsers.map(u => {
            if (u._id === targetUser._id) {
                const newFollowers = isFollowing 
                    ? (u.followers || []).filter(id => id !== user._id)
                    : [...(u.followers || []), user._id];
                return { ...u, followers: newFollowers };
            }
            return u;
        }));

        try {
            if (isFollowing) {
                await userService.unfollowUser(targetUser._id);
            } else {
                await userService.followUser(targetUser._id);
            }
        } catch (err) {
            // Revert optimistic update on error
            setUsers(prevUsers => prevUsers.map(u => {
                if (u._id === targetUser._id) {
                    return targetUser; // Revert to original state
                }
                return u;
            }));
            console.error("Follow toggle failed:", err);
        }
    }, [user, setUsers]);

    // ── Render item (memoised) ────────────────────────────────
    const renderItem = useCallback(({ item }: { item: User }) => {
        const imageUri = getProfileImage(item.profilePicture);
        const isFollowing = user ? item.followers?.includes(user._id) : false;
        return (
            <TouchableOpacity style={styles.userCard} activeOpacity={0.75}>
                {/* Avatar */}
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                        <Text style={styles.avatarInitial}>
                            {item.fullName?.[0]?.toUpperCase() ?? '?'}
                        </Text>
                    </View>
                )}

                {/* Info */}
                <View style={styles.userInfo}>
                    <Text style={styles.userName} numberOfLines={1}>
                        {item.fullName}
                    </Text>
                    <Text style={styles.userHandle} numberOfLines={1}>
                        @{item.username}
                    </Text>
                    {!!item.bio && (
                        <Text style={styles.userBio} numberOfLines={2}>
                            {item.bio}
                        </Text>
                    )}
                </View>

                {/* Follower chip / Action */}
                <View style={styles.actionArea}>
                    <TouchableOpacity 
                        style={[styles.followBtn, isFollowing && styles.followingBtn]}
                        onPress={() => handleFollowToggle(item)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                            {isFollowing ? 'Following' : 'Follow'}
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles.statsText}>
                        {item.followers?.length ?? 0} followers
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }, [getProfileImage, user, handleFollowToggle]);

    const isEmpty = !loading && !error && users.length === 0;

    return (
        <View style={styles.container}>

            {/* ── Header ─────────────────────────────────── */}
            <View style={styles.header}>
                <Text style={styles.title}>Search</Text>
                <Text style={styles.tagline}>Find people in your network</Text>
            </View>

            {/* ── Search Bar ─────────────────────────────── */}
            <View style={styles.searchBar}>
                <Text style={styles.searchIcon}>⌕</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or username…"
                    placeholderTextColor={theme.colors.outline}
                    value={query}
                    onChangeText={handleSearch}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                />
            </View>

            {/* ── Results / States ───────────────────────── */}
            <View style={styles.body}>

                {loading && (
                    <View style={styles.stateContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.stateLabel}>Searching…</Text>
                    </View>
                )}

                {!loading && !!error && (
                    <View style={styles.stateContainer}>
                        <Text style={styles.errorIcon}>⚠</Text>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {!loading && !error && isEmpty && query.trim().length > 0 && (
                    <View style={styles.stateContainer}>
                        <Text style={styles.stateEmoji}>👤</Text>
                        <Text style={styles.stateTitle}>No users found</Text>
                        <Text style={styles.stateDesc}>
                            Try a different name or username.
                        </Text>
                    </View>
                )}

                {!loading && !error && isEmpty && query.trim().length === 0 && (
                    <View style={styles.stateContainer}>
                        <Text style={styles.stateEmoji}>🔍</Text>
                        <Text style={styles.stateTitle}>Find someone</Text>
                        <Text style={styles.stateDesc}>
                            Start typing to search for people.
                        </Text>
                    </View>
                )}

                {!loading && !error && users.length > 0 && (
                    <>
                        <Text style={styles.resultMeta}>
                            {users.length} {users.length === 1 ? 'result' : 'results'}
                        </Text>
                        <FlatList
                            data={users}
                            renderItem={renderItem}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={styles.listContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        />
                    </>
                )}
            </View>
        </View>
    );
}

// ── Styles (Architectural Sentinel tokens) ────────────────────
const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: 60,
    },

    // Header
    header: {
        paddingHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
    },
    title: {
        fontFamily: theme.typography.fonts.display,
        fontSize: theme.typography.sizes.headline_lg,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.on_surface,
        letterSpacing: theme.typography.tracking.headline,
    },
    tagline: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_sm,
        fontWeight: theme.typography.weights.regular,
        color: theme.colors.on_surface_variant,
        marginTop: theme.spacing.xs,
    },

    // Search bar
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.base,
        paddingHorizontal: theme.spacing.base,
        height: 52,
        backgroundColor: theme.colors.surface_container_low,
        borderRadius: theme.radius['2xl'],
        borderWidth: theme.ghostBorder.borderWidth,
        borderColor: theme.ghostBorder.borderColor,
        ...theme.elevation[1],
    },
    searchIcon: {
        fontSize: 20,
        color: theme.colors.outline,
        marginRight: theme.spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_lg,
        fontWeight: theme.typography.weights.regular,
        color: theme.colors.on_surface,
        paddingVertical: 0,
    },

    // Body
    body: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
    },
    resultMeta: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_md,
        fontWeight: theme.typography.weights.medium,
        color: theme.colors.on_surface_variant,
        marginBottom: theme.spacing.sm,
        letterSpacing: theme.typography.tracking.label,
    },
    listContent: {
        paddingBottom: theme.spacing['4xl'],
        gap: theme.spacing.sm,
    },

    // User card
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface_container_lowest,
        borderRadius: theme.radius['2xl'],
        paddingVertical: theme.spacing.md,
        paddingLeft: theme.spacing.xl,      // asymmetric — trust doc §5
        paddingRight: theme.spacing.base,
        borderWidth: theme.ghostBorder.borderWidth,
        borderColor: theme.ghostBorder.borderColor,
        ...theme.elevation[1],
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: theme.radius.full,
        marginRight: theme.spacing.md,
    },
    avatarFallback: {
        backgroundColor: theme.colors.secondary_container,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontFamily: theme.typography.fonts.display,
        fontSize: theme.typography.sizes.title_lg,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.on_secondary_container,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontFamily: theme.typography.fonts.display,
        fontSize: theme.typography.sizes.title_md,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.on_surface,
        letterSpacing: theme.typography.tracking.title,
    },
    userHandle: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_md,
        fontWeight: theme.typography.weights.regular,
        color: theme.colors.outline,
        marginTop: 2,
        letterSpacing: theme.typography.tracking.label,
    },
    userBio: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_sm,
        fontWeight: theme.typography.weights.regular,
        color: theme.colors.on_surface_variant,
        marginTop: theme.spacing.xs,
        lineHeight: theme.typography.sizes.body_sm * theme.typography.leading.body,
    },
    actionArea: {
        alignItems: 'flex-end',
        marginLeft: theme.spacing.sm,
        minWidth: 80,
    },
    followBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.full,
        marginBottom: 4,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
    },
    followingBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.outline,
    },
    followBtnText: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_sm,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.on_primary,
    },
    followingBtnText: {
        color: theme.colors.on_surface,
    },
    statsText: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_sm,
        fontWeight: theme.typography.weights.regular,
        color: theme.colors.outline,
    },

    // Empty / loading / error states
    stateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: theme.spacing['5xl'],
    },
    stateEmoji: {
        fontSize: 48,
        marginBottom: theme.spacing.base,
    },
    stateTitle: {
        fontFamily: theme.typography.fonts.display,
        fontSize: theme.typography.sizes.headline_sm,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.on_surface,
        marginBottom: theme.spacing.xs,
    },
    stateDesc: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_md,
        fontWeight: theme.typography.weights.regular,
        color: theme.colors.on_surface_variant,
        textAlign: 'center',
        maxWidth: 240,
        lineHeight: theme.typography.sizes.body_md * theme.typography.leading.body,
    },
    stateLabel: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_sm,
        color: theme.colors.on_surface_variant,
        marginTop: theme.spacing.sm,
    },
    errorIcon: {
        fontSize: 32,
        marginBottom: theme.spacing.sm,
    },
    errorText: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_md,
        color: theme.colors.error,
        textAlign: 'center',
    },
}));
