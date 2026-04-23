// ColonyHealthCard – SRP: only displays colony health metrics.
// DIP: receives IColonyHealth via props.

import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import type { IColonyHealth } from '../../types/feed';

interface ColonyHealthCardProps {
    health: IColonyHealth;
}

export function ColonyHealthCard({ health }: ColonyHealthCardProps) {
    const { theme } = useUnistyles();

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.tertiary_container }]}>
            <View style={styles.header}>
                <Text style={styles.shield}>🛡</Text>
                <Text style={[styles.title, { color: theme.colors.tertiary_fixed }]}>
                    Colony Health
                </Text>
            </View>
            <View style={styles.statsRow}>
                <View style={styles.statBlock}>
                    <Text style={[styles.statLabel, { color: theme.colors.on_tertiary_container }]}>
                        RESOLVED THIS MONTH
                    </Text>
                    <Text style={[styles.statValue, { color: theme.colors.tertiary_fixed }]}>
                        {health.resolvedThisMonth}
                    </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.colors.on_tertiary_container }]} />
                <View style={styles.statBlock}>
                    <Text style={[styles.statLabel, { color: theme.colors.on_tertiary_container }]}>
                        ACTIVE ISSUES
                    </Text>
                    <Text style={[styles.statValue, { color: theme.colors.tertiary_fixed }]}>
                        {health.activeIssues}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    card: {
        borderRadius: theme.radius.lg,
        padding: theme.spacing.xl,
        marginBottom: theme.spacing.base,
        ...theme.elevation[1],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.base,
    },
    shield: { fontSize: 18 },
    title: {
        fontSize: theme.typography.sizes.title_md,
        fontWeight: theme.typography.weights.bold,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xl,
    },
    statBlock: { flex: 1 },
    statLabel: {
        fontSize: theme.typography.sizes.label_sm,
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    statValue: {
        fontSize: theme.typography.sizes.display_sm,
        fontWeight: theme.typography.weights.extrabold,
        lineHeight: theme.typography.sizes.display_sm * 1.1,
    },
    divider: {
        width: 1,
        height: 40,
        opacity: 0.3,
    },
}));
