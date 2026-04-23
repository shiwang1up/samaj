// ReportCTACard – SRP: only renders the "report an issue" prompt.
// OCP: label / action are injectable via props so the card can be
//      reused on other screens without modification.

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ReportCTACardProps {
    onReport?: () => void;
    /** Override button label. Defaults to "Report New Issue" */
    ctaLabel?: string;
}

export function ReportCTACard({ onReport, ctaLabel = 'Report New Issue' }: ReportCTACardProps) {
    const { theme } = useUnistyles();

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.surface_container_low }]}>
            <Text style={[styles.heading, { color: theme.colors.on_surface }]}>
                Notice an issue?
            </Text>
            <Text style={[styles.sub, { color: theme.colors.on_surface_variant }]}>
                Report civic issues directly to your local representatives and track their progress.
            </Text>
            <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.colors.surface_container }]}
                onPress={onReport}
                activeOpacity={0.8}
            >
                <Ionicons name="add-circle-outline" size={16} color={theme.colors.primary} />
                <Text style={[styles.btnText, { color: theme.colors.primary }]}>
                    {ctaLabel}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    card: {
        borderRadius: theme.radius.lg,
        padding: theme.spacing.xl,
        marginBottom: theme.spacing.base,
        gap: theme.spacing.sm,
    },
    heading: {
        fontSize: theme.typography.sizes.title_md,
        fontWeight: theme.typography.weights.bold,
    },
    sub: {
        fontSize: theme.typography.sizes.body_sm,
        lineHeight: theme.typography.sizes.body_sm * theme.typography.leading.body,
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radius.md,
        marginTop: theme.spacing.xs,
        borderWidth: 1,
        borderColor: 'rgba(192, 201, 193, 0.15)',
    },
    btnText: {
        fontSize: theme.typography.sizes.label_md,
        fontWeight: theme.typography.weights.semibold,
    },
}));
