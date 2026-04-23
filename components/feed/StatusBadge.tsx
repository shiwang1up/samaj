// StatusBadge – SRP: only renders a coloured status label.
// OCP: new statuses can be added by extending STATUS_CONFIG, not editing logic.

import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import type { IssueStatus } from '../../types/feed';

// ── Config map keeps badge logic closed for modification ──────
const STATUS_CONFIG: Record<IssueStatus, { icon: string | null; colorKey: 'error' | 'secondary' | 'tertiary' }> = {
    UNRESOLVED:  { icon: '⚠',  colorKey: 'error' },
    'IN PROGRESS': { icon: null, colorKey: 'secondary' },
    RESOLVED:    { icon: '✓',  colorKey: 'tertiary' },
};

interface StatusBadgeProps {
    status: IssueStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const { theme } = useUnistyles();
    const config = STATUS_CONFIG[status];

    const bgColor = {
        error:     theme.colors.error_container,
        secondary: theme.colors.secondary_container,
        tertiary:  theme.colors.tertiary_container,
    }[config.colorKey];

    const textColor = {
        error:     theme.colors.error,
        secondary: theme.colors.secondary,
        tertiary:  theme.colors.on_tertiary_container,
    }[config.colorKey];

    return (
        <View style={[styles.wrapper, { backgroundColor: bgColor }]}>
            {config.icon && <Text style={styles.icon}>{config.icon}</Text>}
            <Text style={[styles.text, { color: textColor }]}>{status}</Text>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 3,
        borderRadius: theme.radius.md,
        gap: 4,
        alignSelf: 'flex-start',
    },
    icon: { fontSize: 10 },
    text: {
        fontSize: theme.typography.sizes.label_sm,
        fontWeight: theme.typography.weights.bold,
        letterSpacing: 0.8,
    },
}));
