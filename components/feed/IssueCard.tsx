// IssueCard – SRP: renders a single citizen-reported issue.
// DIP: receives IIssue via props, never reads global mock data.

import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import type { IIssue } from '../../types/feed';
import { StatusBadge } from './StatusBadge';

interface IssueCardProps {
    issue: IIssue;
    onUpvote?: (id: string) => void;
}

export function IssueCard({ issue, onUpvote }: IssueCardProps) {
    const { theme } = useUnistyles();

    return (
        <View style={styles.card}>
            {/* Image with left accent bar */}
            <View style={styles.imageWrap}>
                <View style={[styles.accentBar, { backgroundColor: theme.colors.error }]} />
                <Image
                    source={{ uri: issue.imageUri }}
                    style={styles.heroImage}
                    resizeMode="cover"
                />
            </View>

            <View style={styles.body}>
                {/* Meta row */}
                <View style={styles.metaRow}>
                    <StatusBadge status={issue.status} />
                    <Text style={[styles.timeText, { color: theme.colors.on_surface_variant }]}>
                        {issue.time}
                    </Text>
                </View>

                {/* Title */}
                <Text style={[styles.title, { color: theme.colors.on_surface }]}>
                    {issue.title}
                </Text>

                {/* Body */}
                <Text
                    style={[styles.bodyText, { color: theme.colors.on_surface_variant }]}
                    numberOfLines={2}
                >
                    {issue.body}
                </Text>

                {/* Footer */}
                <View style={styles.footer}>
                    {/* Avatar stack */}
                    <View style={styles.avatarStack}>
                        {issue.supporterColors.map((color, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.avatar,
                                    {
                                        backgroundColor: color,
                                        borderColor: theme.colors.surface_container_lowest,
                                        marginLeft: i === 0 ? 0 : -8,
                                    },
                                ]}
                            />
                        ))}
                        <Text style={[styles.supportText, { color: theme.colors.on_surface_variant }]}>
                            +{issue.supporters}  Supporting
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.upvoteBtn, { backgroundColor: theme.colors.primary }]}
                        onPress={() => onUpvote?.(issue.id)}
                        activeOpacity={0.85}
                    >
                        <Text style={[styles.upvoteBtnText, { color: theme.colors.on_primary }]}>
                            Upvote Issue
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    card: {
        backgroundColor: theme.colors.surface_container_lowest,
        borderRadius: theme.radius.lg,
        overflow: 'hidden',
        marginBottom: theme.spacing.base,
        ...theme.elevation[1],
    },
    imageWrap: {
        flexDirection: 'row',
        height: 160,
    },
    accentBar: { width: 4 },
    heroImage: {
        flex: 1,
        height: 160,
    },
    body: {
        paddingLeft: theme.spacing.xl,
        paddingRight: theme.spacing.base,
        paddingVertical: theme.spacing.base,
        gap: theme.spacing.sm,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeText: {
        fontSize: theme.typography.sizes.label_sm,
    },
    title: {
        fontSize: theme.typography.sizes.title_md,
        fontWeight: theme.typography.weights.bold,
        lineHeight: theme.typography.sizes.title_md * theme.typography.leading.title,
    },
    bodyText: {
        fontSize: theme.typography.sizes.body_sm,
        lineHeight: theme.typography.sizes.body_sm * theme.typography.leading.body,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: theme.spacing.xs,
    },
    avatarStack: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
    },
    supportText: {
        fontSize: theme.typography.sizes.label_sm,
        marginLeft: theme.spacing.sm,
    },
    upvoteBtn: {
        paddingHorizontal: theme.spacing.base,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.md,
    },
    upvoteBtnText: {
        fontSize: theme.typography.sizes.label_sm,
        fontWeight: theme.typography.weights.semibold,
    },
}));
