/**
 * StoryReel – horizontally scrollable civic story bubbles.
 *
 * SRP: only renders the story strip.
 * OCP: story data is injected via props; "Your Story" slot is always first.
 *
 * Circles — not squares. Stories use borderRadius: CIRCLE_SIZE / 2 to enforce
 * perfect circles regardless of platform.
 */

import React from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// ── Types ──────────────────────────────────────────────────────
export interface IStory {
    id: string;
    label: string;
    /** Single letter / emoji shown inside the circle when no image */
    initial: string;
    avatarColor: string;
    /** Whether the ring is active (unseen story) */
    hasUnseen: boolean;
    /** Optional image URI — not used in mock but ready for real data */
    imageUri?: string;
}

interface StoryReelProps {
    stories: IStory[];
    onAddStory?: () => void;
    onStoryPress?: (story: IStory) => void;
}

// ── Constants ──────────────────────────────────────────────────
const CIRCLE = 64;            // outer circle diameter
const RING   = CIRCLE +10;   // ring wraps circle with 3px padding each side

// ── StoryBubble ────────────────────────────────────────────────
function StoryBubble({
    story,
    onPress,
}: {
    story: IStory;
    onPress?: () => void;
}) {
    const { theme } = useUnistyles();

    return (
        <TouchableOpacity
            style={styles.bubbleWrap}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Gradient-style ring — primary when unseen, muted when seen */}
            <View
                style={[
                    styles.ring,
                    {
                        borderColor: story.hasUnseen
                            ? theme.colors.primary
                            : theme.colors.surface_container_highest,
                    },
                ]}
            >
                {/* Circle avatar */}
                <View style={[styles.circle, { backgroundColor: story.avatarColor }]}>
                    <Text style={styles.initial}>{story.initial}</Text>
                </View>
            </View>

            <Text
                style={[styles.label, { color: theme.colors.on_surface }]}
                numberOfLines={1}
            >
                {story.label}
            </Text>
        </TouchableOpacity>
    );
}

// ── YourStory bubble ───────────────────────────────────────────
function YourStoryBubble({ onPress }: { onPress?: () => void }) {
    const { theme } = useUnistyles();

    return (
        <TouchableOpacity
            style={styles.bubbleWrap}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Dashed/muted ring for "add story" */}
            <View   
                style={[
                    styles.ring,
                    {
                        borderColor: theme.colors.outline_variant,
                        borderStyle: 'dashed',
                    },
                ]}
            >
                <View style={[styles.circle, { backgroundColor: theme.colors.surface_container }]}>
                    <Text style={{ fontSize: 24 }}>👤</Text>
                </View>
            </View>

            {/* Plus badge */}
            <View style={[styles.plusBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.plusText}>+</Text>
            </View>

            <Text
                style={[styles.label, styles.labelBold, { color: theme.colors.on_surface }]}
                numberOfLines={1}
            >
                Your Story
            </Text>
        </TouchableOpacity>
    );
}

// ── StoryReel ──────────────────────────────────────────────────
export function StoryReel({ stories, onAddStory, onStoryPress }: StoryReelProps) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reel}
        >
            <YourStoryBubble onPress={onAddStory} />
            {stories.map((story) => (
                <StoryBubble
                    key={story.id}
                    story={story}
                    onPress={() => onStoryPress?.(story)}
                />
            ))}
        </ScrollView>
    );
}

// ── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create((theme) => ({
    reel: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.base,
        gap: theme.spacing.base,
        alignItems: 'flex-start',
    },

    bubbleWrap: {
        alignItems: 'center',
        width: RING + 4,       // give label room to match ring width
        position: 'relative',
    },

    // Perfect circle ring
    ring: {
        width: RING,
        height: RING,
        borderRadius: RING / 2,   // ← enforces circle
        borderWidth: 2.5,
        padding: 2,               // gap between ring and avatar
        marginBottom: theme.spacing.xs,
    },

    // Perfect circle avatar
    circle: {
        width: CIRCLE,
        height: CIRCLE,
        borderRadius: CIRCLE / 2,  // ← enforces circle
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },

    initial: {
        color: '#ffffff',
        fontSize: 22,
        fontWeight: '700',
    },

    label: {
        fontSize: theme.typography.sizes.label_sm,
        textAlign: 'center',
        maxWidth: RING + 8,
    },
    labelBold: {
        fontWeight: theme.typography.weights.bold,
    },

    // "+" badge overlaid on YourStory circle
    plusBadge: {
        position: 'absolute',
        top: RING - 16,           // sits at bottom-right of ring
        right: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.colors.surface_container_lowest,
    },
    plusText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '700',
        lineHeight: 16,
    },
}));
