/**
 * PostImageCarousel – SRP: only handles rendering a swipeable image gallery.
 *
 * Single image → plain Image.
 * Multiple    → horizontal ScrollView with pagingEnabled,
 *               Instagram-style "1/3" badge top-right,
 *               dot row at the bottom.
 */

import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Config } from '../../constants/Config';

// ── Helpers ───────────────────────────────────────────────────
const SCREEN_WIDTH = Dimensions.get('window').width;
// Card spans screen minus both horizontal margins (theme.spacing.xl = 24)
const CARD_IMAGE_WIDTH = SCREEN_WIDTH - 48;

const resolveUrl = (url: string): string | null => {
    if (!url) return null;
    return url.includes('localhost') ? url.replace('localhost', Config.HOST) : url;
};

// ── Component ─────────────────────────────────────────────────
interface PostImageCarouselProps {
    images: string[];
    height?: number;
}

export function PostImageCarousel({ images, height = 220 }: PostImageCarouselProps) {
    const [index, setIndex] = useState(0);

    const resolved = images.map(resolveUrl).filter(Boolean) as string[];
    if (resolved.length === 0) return null;

    // Single image — skip carousel overhead
    if (resolved.length === 1) {
        return (
            <Image
                source={{ uri: resolved[0] }}
                style={[styles.image, { width: CARD_IMAGE_WIDTH, height }]}
                resizeMode="cover"
            />
        );
    }

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const newIndex = Math.round(
            e.nativeEvent.contentOffset.x / CARD_IMAGE_WIDTH,
        );
        if (newIndex !== index) setIndex(newIndex);
    };

    return (
        <View style={[styles.container, { height: height + 16 }]}>
            {/* Swipeable images */}
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={CARD_IMAGE_WIDTH}
                snapToAlignment="start"
                onMomentumScrollEnd={onScroll}
                style={{ width: CARD_IMAGE_WIDTH }}
            >
                {resolved.map((uri, i) => (
                    <Image
                        key={i}
                        source={{ uri }}
                        style={{ width: CARD_IMAGE_WIDTH, height }}
                        resizeMode="cover"
                    />
                ))}
            </ScrollView>

            {/* Instagram-style "1/3" counter — top right */}
            <View style={styles.badge} pointerEvents="none">
                <Text style={styles.badgeText}>
                    {index + 1}/{resolved.length}
                </Text>
            </View>

            {/* Dot indicators — bottom centre */}
            <View style={styles.dots} pointerEvents="none">
                {resolved.map((_, i) => (
                    <View
                        key={i}
                        style={[styles.dot, i === index && styles.dotActive]}
                    />
                ))}
            </View>
        </View>
    );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create((theme) => ({
    container: {
        position: 'relative',
        overflow: 'hidden',
    },
    image: {
        // single-image case — no extra wrapper needed
    },

    // "1/3" badge — top right corner
    badge: {
        position: 'absolute',
        top: theme.spacing.sm,        // 8
        right: theme.spacing.sm,      // 8
        backgroundColor: 'rgba(0,0,0,0.55)',
        paddingHorizontal: theme.spacing.sm,   // 8
        paddingVertical: 3,
        borderRadius: theme.radius.full,
    },
    badgeText: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_sm,  // 11
        fontWeight: theme.typography.weights.semibold,
        color: '#ffffff',
        letterSpacing: 0.4,
    },

    // Dot row — bottom centre
    dots: {
        position: 'absolute',
        bottom: 4,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 5,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.45)',
    },
    dotActive: {
        backgroundColor: '#ffffff',
        width: 18,    // pill shape for active dot (like Instagram)
        borderRadius: 3,
    },
}));
