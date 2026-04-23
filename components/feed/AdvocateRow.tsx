// AdvocateRow – SRP: renders exactly one advocate list item.
// DIP: receives IAdvocate via props.

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import type { IAdvocate } from '../../types/feed';

interface AdvocateRowProps {
    advocate: IAdvocate;
}

export function AdvocateRow({ advocate }: AdvocateRowProps) {
    const { theme } = useUnistyles();
    const initials = advocate.name
        .split(' ')
        .map((w) => w[0])
        .join('');

    return (
        <View style={styles.row}>
            <View style={[styles.avatar, { backgroundColor: advocate.avatarColor }]}>
                <Text style={styles.initials}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.colors.on_surface }]}>
                    {advocate.name}
                </Text>
                <Text style={[styles.sub, { color: theme.colors.on_surface_variant }]}>
                    {advocate.reportCount} Reports
                </Text>
            </View>
            <Ionicons name="ribbon-outline" size={18} color={theme.colors.tertiary} />
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        // No dividers — spacing only (design system mandate)
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    initials: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    name: {
        fontSize: theme.typography.sizes.label_md,
        fontWeight: theme.typography.weights.semibold,
    },
    sub: {
        fontSize: theme.typography.sizes.label_sm,
    },
}));
