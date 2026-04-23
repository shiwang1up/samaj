// TopBar – SRP: app-wide navigation bar, reusable on any screen.
// OCP: title, subtitle, and right-side actions are injectable via
//      props so the bar can be extended without modification.
// ISP: props interface is minimal — consumers only pass what they need.

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface TopBarProps {
    onMenuPress?: () => void;
    onNotificationsPress?: () => void;
    onAvatarPress?: () => void;
    /** Single uppercase letter shown in the avatar circle */
    avatarLabel?: string;
}

export function TopBar({
    onMenuPress,
    onNotificationsPress,
    onAvatarPress,
    avatarLabel = 'U',
}: TopBarProps) {
    const { theme } = useUnistyles();

    return (
        <View style={styles.bar}>
            <TouchableOpacity style={styles.iconBtn} onPress={onMenuPress}>
                <Ionicons name="menu" size={22} color={theme.colors.on_surface} />
            </TouchableOpacity>

            <View style={styles.brand}>
                <Text style={styles.brandIcon}>🏛</Text>
                <Text style={[styles.brandName, { color: theme.colors.primary }]}>Samaj</Text>
            </View>

            <View style={styles.rightCluster}>
                <TouchableOpacity style={styles.iconBtn} onPress={onNotificationsPress}>
                    <Ionicons
                        name="notifications-outline"
                        size={22}
                        color={theme.colors.on_surface}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.avatar, { backgroundColor: theme.colors.primary_container }]}
                    onPress={onAvatarPress}
                >
                    <Text style={[styles.avatarText, { color: theme.colors.on_primary_container }]}>
                        {avatarLabel}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.xl,
        paddingTop: 56,
        paddingBottom: theme.spacing.base,
        backgroundColor: theme.colors.surface,
    },
    brand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    brandIcon: { fontSize: 18 },
    brandName: {
        fontSize: theme.typography.sizes.title_md,
        fontWeight: theme.typography.weights.bold,
    },
    rightCluster: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    iconBtn: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontWeight: '700',
        fontSize: 13,
    },
}));
