import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    Image,
    TouchableOpacity,
    SafeAreaView,
    StyleSheet as RNStyleSheet,
    Dimensions
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Story } from '../../services/story/IStoryService';
import { Config } from '../../constants/Config';

interface StoryViewerModalProps {
    visible: boolean;
    userStories: Story[] | null;
    onClose: () => void;
    onStoryViewed: (storyId: string) => void;
}

const { width, height } = Dimensions.get('window');

const timeAgo = (iso: string): string => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (days  > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins  > 0) return `${mins}m ago`;
    return 'just now';
};

const resolveUrl = (url?: string) => {
    if (!url) return undefined;
    return url.includes('localhost') ? url.replace('localhost', Config.HOST) : url;
};

export function StoryViewerModal({ visible, userStories, onClose, onStoryViewed }: StoryViewerModalProps) {
    const { theme } = useUnistyles();
    const [progress, setProgress] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Reset when modal opens with new user
    useEffect(() => {
        if (visible && userStories && userStories.length > 0) {
            setCurrentIndex(0);
            setProgress(0);
        }
    }, [visible, userStories]);

    // Basic auto-advance timer like WhatsApp (5 seconds)
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (visible && userStories && currentIndex < userStories.length) {
            const currentStory = userStories[currentIndex];
            onStoryViewed(currentStory._id);
            setProgress(0);

            interval = setInterval(() => {
                setProgress(p => {
                    if (p >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return p + 2; // 5 seconds (100 / (5000 / 100)) = 2 per 100ms
                });
            }, 100);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [visible, userStories, currentIndex, onStoryViewed]);

    // Close or advance when progress is complete
    useEffect(() => {
        if (progress >= 100 && visible && userStories) {
            if (currentIndex < userStories.length - 1) {
                setCurrentIndex(c => c + 1);
                setProgress(0);
            } else {
                onClose();
            }
        }
    }, [progress, visible, userStories, currentIndex, onClose]);

    const handlePress = (evt: any) => {
        const { locationX } = evt.nativeEvent;
        if (locationX < width * 0.3) {
            // Go back
            if (currentIndex > 0) {
                setCurrentIndex(c => c - 1);
                setProgress(0);
            } else {
                setProgress(0); // restart first
            }
        } else {
            // Go forward
            if (currentIndex < (userStories?.length || 0) - 1) {
                setCurrentIndex(c => c + 1);
                setProgress(0);
            } else {
                onClose();
            }
        }
    };

    if (!userStories || userStories.length === 0) return null;
    
    const story = userStories[currentIndex];

    const avatarUri = resolveUrl(story.user?.profilePicture);
    const imageUri = resolveUrl(story.image);
    const hasImage = !!imageUri;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={[styles.container, !hasImage && { backgroundColor: theme.colors.primary }]}>
                {/* Background Image */}
                {hasImage && (
                    <Image 
                        source={{ uri: imageUri }} 
                        style={RNStyleSheet.absoluteFillObject} 
                        resizeMode="cover" 
                    />
                )}

                {/* Dark overlay for better text readability if there's an image */}
                {hasImage && <View style={styles.overlay} />}

                <SafeAreaView style={styles.safeArea}>
                    {/* Top Progress Bar */}
                    <View style={styles.progressContainerWrapper}>
                        {userStories.map((_, idx) => {
                            let w = 0;
                            if (idx < currentIndex) w = 100;
                            else if (idx === currentIndex) w = progress;
                            
                            return (
                                <View key={idx} style={styles.progressSegmentBackground}>
                                    <View style={[styles.progressBar, { width: `${w}%` }]} />
                                </View>
                            );
                        })}
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.userInfo}>
                            {avatarUri ? (
                                <Image source={{ uri: avatarUri }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, styles.avatarFallback]}>
                                    <Text style={styles.avatarInitial}>
                                        {(story.user?.fullName || story.user?.username || '?')[0].toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            <View>
                                <Text style={styles.userName}>{story.user?.fullName || story.user?.username}</Text>
                                <Text style={styles.timeText}>{timeAgo(story.createdAt)}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content area: tap to close / pause can be added here, for now just center text */}
                    <TouchableOpacity 
                        style={styles.contentArea} 
                        activeOpacity={1} 
                        onPress={handlePress} // left to go back, right to advance
                    >
                        {!!story.text && (
                            <View style={[styles.textContainer, hasImage && styles.textContainerOverlay]}>
                                <Text style={[styles.storyText, hasImage && styles.storyTextSmall]}>
                                    {story.text}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: '#000', // Default dark for image background
    },
    overlay: {
        ...RNStyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    safeArea: {
        flex: 1,
    },
    progressContainerWrapper: {
        flexDirection: 'row',
        gap: 4,
        marginHorizontal: theme.spacing.base,
        marginTop: theme.spacing.sm,
    },
    progressSegmentBackground: {
        flex: 1,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 1,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.base,
        paddingTop: theme.spacing.md,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: theme.spacing.sm,
    },
    avatarFallback: {
        backgroundColor: theme.colors.surface_container_highest,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.on_surface,
    },
    userName: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    timeText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginTop: 2,
    },
    closeButton: {
        padding: theme.spacing.xs,
    },
    closeIcon: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    contentArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainerOverlay: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: theme.spacing.lg,
        borderRadius: theme.radius.lg,
        marginTop: 'auto', // push to bottom
        marginBottom: 80,
    },
    storyText: {
        color: '#ffffff',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    storyTextSmall: {
        fontSize: 20,
        fontWeight: '500',
        textShadowColor: 'transparent',
    }
}));
