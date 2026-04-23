// UpdateCard – SRP: renders a single official council update.
// DIP: receives IUpdate via props, zero global data dependencies.

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import type { IUpdate } from '../../types/feed';
import { StatusBadge } from './StatusBadge';

interface UpdateCardProps {
    update: IUpdate;
    onJoinDiscussion?: (id: string) => void;
}

export function UpdateCard({ update, onJoinDiscussion }: UpdateCardProps) {
    const { theme } = useUnistyles();

    return (
        <View style={styles.card}>
            <View style={styles.body}>
                {/* Author row */}
                <View style={styles.authorRow}>
                    <View style={[styles.authorAvatar, { backgroundColor: theme.colors.secondary_container }]}>
                        <Text style={{ fontSize: 12 }}>⚙</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.authorName, { color: theme.colors.on_surface }]}>
                            {update.author}
                        </Text>
                        <Text style={[styles.authorMeta, { color: theme.colors.on_surface_variant }]}>
                            {update.authorBadge} · {update.time}
                        </Text>
                    </View>
                    <StatusBadge status={update.status} />
                </View>

                {/* Title */}
                <Text style={[styles.title, { color: theme.colors.on_surface }]}>
                    {update.title}
                </Text>

                {/* Body */}
                <Text style={[styles.bodyText, { color: theme.colors.on_surface_variant }]}>
                    {update.body}
                </Text>
            </View>

            {/* Image */}
            <Image
                source={{ uri: update.imageUri }}
                style={styles.updateImage}
                resizeMode="cover"
            />

            {/* Engagement footer */}
            <View style={[styles.engagementRow, { borderTopColor: theme.colors.surface_container_highest }]}>
                <View style={styles.commentCount}>
                    <Ionicons name="chatbubble-outline" size={14} color={theme.colors.on_surface_variant} />
                    <Text style={[styles.commentText, { color: theme.colors.on_surface_variant }]}>
                        {update.commentCount} Comments
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => onJoinDiscussion?.(update.id)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.joinText, { color: theme.colors.primary }]}>
                        Join Discussion
                    </Text>
                </TouchableOpacity>
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
    body: {
        paddingLeft: theme.spacing.xl,
        paddingRight: theme.spacing.base,
        paddingVertical: theme.spacing.base,
        gap: theme.spacing.sm,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    authorAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    authorName: {
        fontSize: theme.typography.sizes.label_md,
        fontWeight: theme.typography.weights.semibold,
    },
    authorMeta: {
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
    updateImage: {
        width: '100%',
        height: 160,
    },
    engagementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        borderTopWidth: 1,
    },
    commentCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    commentText: {
        fontSize: theme.typography.sizes.label_sm,
    },
    joinText: {
        fontSize: theme.typography.sizes.label_md,
        fontWeight: theme.typography.weights.semibold,
    },
}));
