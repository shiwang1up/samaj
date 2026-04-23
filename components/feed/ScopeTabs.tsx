// ScopeTabs – SRP: renders only the scope filter tab bar.
// OCP: accepts `scopes` as a generic readonly array — works for any
//      string-union scope list, no hardcoding.

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import type { FeedScope } from '../../types/feed';

interface ScopeTabsProps {
    scopes: readonly FeedScope[];
    activeScope: FeedScope;
    onSelect: (scope: FeedScope) => void;
}

export function ScopeTabs({ scopes, activeScope, onSelect }: ScopeTabsProps) {
    const { theme } = useUnistyles();

    return (
        <View style={styles.row}>
            {scopes.map((tab) => {
                const isActive = activeScope === tab;
                return (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tab,
                            { backgroundColor: theme.colors.surface_container_low },
                            isActive && {
                                backgroundColor: theme.colors.surface_container_lowest,
                                ...theme.elevation[1],
                            },
                        ]}
                        onPress={() => onSelect(tab)}
                        activeOpacity={0.8}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                { color: theme.colors.on_surface_variant },
                                isActive && {
                                    color: theme.colors.primary,
                                    fontWeight: theme.typography.weights.bold,
                                },
                            ]}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    row: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.xl,
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.base,
    },
    tab: {
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.base,
        borderRadius: theme.radius.full,
    },
    tabText: {
        fontSize: theme.typography.sizes.label_md,
        fontWeight: theme.typography.weights.medium,
    },
}));
