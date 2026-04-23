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
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Config } from '../../constants/Config';
import { useSearchUsers } from '../../hooks/useSearchUsers';
import { UserService } from '../../services/user/UserService';
import { User } from '../../services/user/IUserService';

// ── Composition root: one stable instance per screen mount ────
const userService = new UserService();

export default function SearchScreen() {
    const { theme } = useUnistyles();

    // DIP: hook receives the service, not "new UserService()" inside
    const { searchUsers, users, loading, error } = useSearchUsers(userService);
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

    // ── Render item (memoised) ────────────────────────────────
    const renderItem = useCallback(({ item }: { item: User }) => {
        const imageUri = getProfileImage(item.profilePicture);
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

                {/* Follower chip */}
                <View style={styles.followerChip}>
                    <Text style={styles.followerCount}>
                        {item.followers?.length ?? 0}
                    </Text>
                    <Text style={styles.followerLabel}>followers</Text>
                </View>
            </TouchableOpacity>
        );
    }, [getProfileImage]);

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
    followerChip: {
        alignItems: 'center',
        marginLeft: theme.spacing.sm,
        minWidth: 44,
    },
    followerCount: {
        fontFamily: theme.typography.fonts.display,
        fontSize: theme.typography.sizes.title_sm,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.primary,
    },
    followerLabel: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_sm,
        fontWeight: theme.typography.weights.regular,
        color: theme.colors.outline,
        marginTop: 1,
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
