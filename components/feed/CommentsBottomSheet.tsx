/**
 * CommentsBottomSheet – Instagram-style bottom sheet for post comments.
 *
 * SRP  : only responsible for rendering comments + sheet animation.
 * OCP  : add reply expansion, add-comment input without changing this contract.
 *
 * Animation: Animated.spring slide-up on open, Animated.timing slide-down on close.
 * Backdrop tap dismisses the sheet.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Config } from '../../constants/Config';
import { Comment, CommentReply } from '../../services/comment/ICommentService';

// ── Constants ─────────────────────────────────────────────────
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.72;

// ── Helpers ───────────────────────────────────────────────────
const resolveAvatar = (url: string) =>
    url?.includes('localhost') ? url.replace('localhost', Config.HOST) : url;

const timeAgo = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);
    const weeks = Math.floor(diff / 604_800_000);
    if (weeks > 0) return `${weeks}w`;
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (mins > 0) return `${mins}m`;
    return 'now';
};

// ── ReplyRow ─────────────────────────────────────────────────
interface ReplyRowProps {
    reply: CommentReply;
    isUpvoted: boolean;
    onUpvote: (replyId: string, isUpvoted: boolean) => void;
}

function ReplyRow({ reply, isUpvoted, onUpvote }: ReplyRowProps) {
    const avatarUri = resolveAvatar(reply.user.profilePicture);
    return (
        <View style={rowStyles.replyRow}>
            {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={rowStyles.replyAvatar} />
            ) : (
                <View style={[rowStyles.replyAvatar, rowStyles.avatarFallback]}>
                    <Text style={rowStyles.replyAvatarInitial}>
                        {reply.user.fullName?.[0]?.toUpperCase() ?? '?'}
                    </Text>
                </View>
            )}
            <View style={rowStyles.body}>
                <Text style={rowStyles.text} numberOfLines={0}>
                    <Text style={rowStyles.username}>{reply.user.username} </Text>
                    {reply.text}
                </Text>
                <View style={rowStyles.meta}>
                    <Text style={rowStyles.metaText}>{timeAgo(reply.createdAt)}</Text>
                    {reply.likes.length > 0 && (
                        <Text style={rowStyles.metaText}>
                            {reply.likes.length} like{reply.likes.length > 1 ? 's' : ''}
                        </Text>
                    )}
                </View>
            </View>
            {/* ▲ Upvote toggle */}
            <TouchableOpacity
                style={[rowStyles.upvoteBtn, isUpvoted && rowStyles.upvoteBtnActive]}
                onPress={() => onUpvote(reply._id, isUpvoted)}
                activeOpacity={0.7}
            >
                <Text style={[rowStyles.upvoteArrow, isUpvoted && rowStyles.upvoteArrowActive]}>
                    ▲
                </Text>
                {reply.likes.length > 0 && (
                    <Text style={[rowStyles.upvoteCount, isUpvoted && rowStyles.upvoteCountActive]}>
                        {reply.likes.length}
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

// ── CommentRow ────────────────────────────────────────────────
interface CommentRowProps {
    comment: Comment;
    currentUserId: string;
    isUpvoted: boolean;
    onUpvote: (commentId: string, isUpvoted: boolean) => void;
    onFetchReplies: (commentId: string) => Promise<CommentReply[]>;
    onReplyUpvote: (commentId: string, replyId: string, isUpvoted: boolean) => Promise<void>;
}

function CommentRow({
    comment, currentUserId, isUpvoted, onUpvote, onFetchReplies, onReplyUpvote,
}: CommentRowProps) {
    const avatarUri = resolveAvatar(comment.user.profilePicture);

    const [expanded, setExpanded] = useState(false);
    const [repliesLoading, setRLoading] = useState(false);
    const [replies, setReplies] = useState<CommentReply[]>(
        Array.isArray(comment.replies) ? comment.replies : [],
    );
    const fetchedRef = useRef(false);

    const handleToggleReplies = useCallback(async () => {
        const replyCount = Array.isArray(comment.replies) ? comment.replies.length : 0;
        if (!expanded && !fetchedRef.current && replyCount > 0) {
            setRLoading(true);
            try {
                const fresh = await onFetchReplies(comment._id);
                setReplies(Array.isArray(fresh) ? fresh : []);
                fetchedRef.current = true;
            } catch {
                // keep embedded data on failure
            } finally {
                setRLoading(false);
            }
        }
        setExpanded((v) => !v);
    }, [expanded, comment._id, comment.replies, onFetchReplies]);

    // Reply upvote — optimistic update on local replies state
    const handleReplyUpvote = useCallback(async (replyId: string, isReplyUpvoted: boolean) => {
        setReplies((prev) =>
            prev.map((r) => {
                if (r._id !== replyId) return r;
                return {
                    ...r,
                    likes: isReplyUpvoted
                        ? r.likes.filter((id) => id !== currentUserId)
                        : [...r.likes, currentUserId],
                };
            }),
        );
        try {
            await onReplyUpvote(comment._id, replyId, isReplyUpvoted);
        } catch {
            // revert: re-fetch fresh replies
            if (fetchedRef.current) {
                const fresh = await onFetchReplies(comment._id);
                setReplies(Array.isArray(fresh) ? fresh : []);
            }
        }
    }, [currentUserId, comment._id, onReplyUpvote, onFetchReplies]);

    return (
        <View style={rowStyles.row}>
            {/* Avatar */}
            {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={rowStyles.avatar} />
            ) : (
                <View style={[rowStyles.avatar, rowStyles.avatarFallback]}>
                    <Text style={rowStyles.avatarInitial}>
                        {comment.user.fullName?.[0]?.toUpperCase() ?? '?'}
                    </Text>
                </View>
            )}

            {/* Body */}
            <View style={rowStyles.body}>
                <Text style={rowStyles.text} numberOfLines={0}>
                    <Text style={rowStyles.username}>{comment.user.username} </Text>
                    {comment.text}
                </Text>

                {/* Sub-row: time · reply */}
                <View style={rowStyles.meta}>
                    <Text style={rowStyles.metaText}>{timeAgo(comment.createdAt)}</Text>
                    {comment.likes.length > 0 && (
                        <Text style={rowStyles.metaText}>
                            {comment.likes.length} like{comment.likes.length > 1 ? 's' : ''}
                        </Text>
                    )}
                    <TouchableOpacity>
                        <Text style={rowStyles.replyBtn}>Reply</Text>
                    </TouchableOpacity>
                </View>

                {/* Replies toggle */}
                {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                    <View>
                        <TouchableOpacity
                            style={rowStyles.viewReplies}
                            onPress={handleToggleReplies}
                            activeOpacity={0.7}
                        >
                            <View style={rowStyles.replyLine} />
                            {repliesLoading ? (
                                <ActivityIndicator size="small" />
                            ) : (
                                <Text style={rowStyles.viewRepliesText}>
                                    {expanded
                                        ? 'Hide replies'
                                        : `View ${comment.replies.length} repl${comment.replies.length > 1 ? 'ies' : 'y'}`
                                    }
                                </Text>
                            )}
                        </TouchableOpacity>
                        {expanded && !repliesLoading && Array.isArray(replies) && replies.map((r) => (
                            <ReplyRow
                                key={r._id}
                                reply={r}
                                isUpvoted={Array.isArray(r.likes) && r.likes.includes(currentUserId)}
                                onUpvote={handleReplyUpvote}
                            />
                        ))}
                    </View>
                )}
            </View>

            {/* ▲ Upvote toggle */}
            <TouchableOpacity
                style={[rowStyles.upvoteBtn, isUpvoted && rowStyles.upvoteBtnActive]}
                onPress={() => onUpvote(comment._id, isUpvoted)}
                activeOpacity={0.7}
            >
                <Text style={[rowStyles.upvoteArrow, isUpvoted && rowStyles.upvoteArrowActive]}>
                    ▲
                </Text>
                {comment.likes.length > 0 && (
                    <Text style={[rowStyles.upvoteCount, isUpvoted && rowStyles.upvoteCountActive]}>
                        {comment.likes.length}
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

// ── CommentsBottomSheet ───────────────────────────────────────
interface Props {
    visible: boolean;
    totalCount: number;
    comments: Comment[];
    loading: boolean;
    error: string | null;
    currentUserId: string;
    onCommentUpvote: (commentId: string, isUpvoted: boolean) => void;
    onFetchReplies: (commentId: string) => Promise<CommentReply[]>;
    onReplyUpvote: (commentId: string, replyId: string, isUpvoted: boolean) => Promise<void>;
    onAddComment: (text: string) => Promise<void>;
    onClose: () => void;
}

export function CommentsBottomSheet({
    visible,
    totalCount,
    comments,
    loading,
    error,
    currentUserId,
    onCommentUpvote,
    onFetchReplies,
    onReplyUpvote,
    onAddComment,
    onClose,
}: Props) {
    const { theme } = useUnistyles();
    const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

    // Add comment state
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!visible) setText('');
    }, [visible]);

    const handleSubmit = async () => {
        if (!text.trim()) return;
        setSubmitting(true);
        try {
            await onAddComment(text.trim());
            setText('');
        } catch {
            // Error handling optionally here
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                damping: 20,
                stiffness: 200,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: SHEET_HEIGHT,
                duration: 260,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, slideAnim]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            {/* Backdrop */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={sheetStyles.backdrop} />
            </TouchableWithoutFeedback>

            {/* Sheet */}
            <Animated.View
                style={[
                    sheetStyles.sheet,
                    { transform: [{ translateY: slideAnim }] },
                ]}
            >
                {/* Handle */}
                <View style={sheetStyles.handleWrap}>
                    <View style={sheetStyles.handle} />
                </View>

                {/* Header */}
                <View style={sheetStyles.header}>
                    <Text style={sheetStyles.title}>
                        Comments{totalCount > 0 ? ` (${totalCount})` : ''}
                    </Text>
                </View>

                {/* Content */}
                {loading ? (
                    <View style={sheetStyles.centred}>
                        <ActivityIndicator />
                    </View>
                ) : error ? (
                    <View style={sheetStyles.centred}>
                        <Text style={sheetStyles.errorText}>{error}</Text>
                    </View>
                ) : comments.length === 0 ? (
                    <View style={sheetStyles.centred}>
                        <Text style={sheetStyles.emptyText}>No comments yet.</Text>
                        <Text style={sheetStyles.emptySubText}>Be the first to comment.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={comments}
                        keyExtractor={(c) => c._id}
                        renderItem={({ item }) => (
                            <CommentRow
                                comment={item}
                                currentUserId={currentUserId}
                                isUpvoted={item.likes.includes(currentUserId)}
                                onUpvote={onCommentUpvote}
                                onFetchReplies={onFetchReplies}
                                onReplyUpvote={onReplyUpvote}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={sheetStyles.list}
                        ItemSeparatorComponent={() => <View style={sheetStyles.separator} />}
                    />
                )}

                {/* Input bar */}
                <View style={[sheetStyles.inputBar, { paddingBottom: Platform.OS === 'ios' ? 32 : 16 }]}>
                    <View style={sheetStyles.inputPlaceholder}>
                        <TextInput
                            style={sheetStyles.input}
                            placeholder="Add a comment…"
                            placeholderTextColor={theme.colors.outline}
                            value={text}
                            onChangeText={setText}
                            multiline
                            maxLength={500}
                            editable={!submitting}
                        />
                    </View>
                    <TouchableOpacity
                        style={sheetStyles.sendBtn}
                        onPress={handleSubmit}
                        disabled={submitting || !text.trim()}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        ) : (
                            <Text style={[
                                sheetStyles.sendText,
                                !text.trim() && sheetStyles.sendTextDisabled
                            ]}>
                                Post
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Modal>
    );
}

// ── Styles ────────────────────────────────────────────────────
const sheetStyles = StyleSheet.create((theme) => ({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.48)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: SHEET_HEIGHT,
        backgroundColor: theme.colors.surface_container_lowest,
        borderTopLeftRadius: theme.radius['2xl'],
        borderTopRightRadius: theme.radius['2xl'],
        overflow: 'hidden',
        ...theme.elevation[3],
    },
    handleWrap: {
        alignItems: 'center',
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.xs,
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.colors.outline_variant,
    },
    header: {
        paddingVertical: theme.spacing.sm,
        alignItems: 'center',
        borderBottomWidth: theme.ghostBorder.borderWidth,
        borderBottomColor: theme.ghostBorder.borderColor,
    },
    title: {
        fontFamily: theme.typography.fonts.display,
        fontSize: theme.typography.sizes.title_md,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.on_surface,
        letterSpacing: theme.typography.tracking.display,
    },
    list: {
        paddingHorizontal: theme.spacing.base,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.xl,
    },
    separator: {
        height: theme.spacing.base,
    },
    centred: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.xs,
    },
    errorText: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_sm,
        color: theme.colors.error,
    },
    emptyText: {
        fontFamily: theme.typography.fonts.display,
        fontSize: theme.typography.sizes.title_sm,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.on_surface,
    },
    emptySubText: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_sm,
        color: theme.colors.on_surface_variant,
    },
    // Input bar
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.base,
        paddingVertical: theme.spacing.sm,
        borderTopWidth: theme.ghostBorder.borderWidth,
        borderTopColor: theme.ghostBorder.borderColor,
        gap: theme.spacing.sm,
    },
    inputPlaceholder: {
        flex: 1,
        backgroundColor: theme.colors.surface_container,
        borderRadius: theme.radius.full,
        paddingHorizontal: theme.spacing.base,
        paddingVertical: theme.spacing.xs,
        justifyContent: 'center',
        minHeight: 40,
    },
    input: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_md,
        color: theme.colors.on_surface,
        minHeight: 20,
        maxHeight: 100,
        padding: 0,
    },
    sendBtn: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        justifyContent: 'center',
    },
    sendText: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_lg,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.primary,
    },
    sendTextDisabled: {
        color: theme.colors.outline_variant,
    },
}));

const rowStyles = StyleSheet.create((theme) => ({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.spacing.sm,
    },
    // Indented reply rows
    replyRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.sm,
        marginLeft: 44,   // align with comment body (avatar 36 + gap 8)
    },
    replyAvatar: {
        width: 26,
        height: 26,
        borderRadius: theme.radius.full,
        flexShrink: 0,
    },
    replyAvatarInitial: {
        fontFamily: theme.typography.fonts.display,
        fontSize: 10,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.on_secondary_container,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: theme.radius.full,
        flexShrink: 0,
    },
    avatarFallback: {
        backgroundColor: theme.colors.secondary_container,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontFamily: theme.typography.fonts.display,
        fontSize: theme.typography.sizes.label_md,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.on_secondary_container,
    },
    body: {
        flex: 1,
        gap: 4,
    },
    text: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_sm,
        color: theme.colors.on_surface,
        lineHeight: theme.typography.sizes.body_sm * 1.45,
    },
    username: {
        fontFamily: theme.typography.fonts.display,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.on_surface,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.base,
    },
    metaText: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_sm,
        color: theme.colors.outline,
    },
    replyBtn: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_sm,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.outline,
    },
    viewReplies: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginTop: 2,
    },
    replyLine: {
        width: 24,
        height: 1,
        backgroundColor: theme.colors.outline,
        opacity: 0.5,
    },
    viewRepliesText: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_sm,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.outline,
    },
    // ▲ upvote toggle
    upvoteBtn: {
        alignItems: 'center',
        gap: 2,
        paddingLeft: theme.spacing.xs,
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: theme.radius.full,
    },
    upvoteBtnActive: {
        backgroundColor: theme.colors.tertiary_container,
    },
    upvoteArrow: {
        fontSize: 14,
        color: theme.colors.outline,
    },
    upvoteArrowActive: {
        color: theme.colors.tertiary,
    },
    upvoteCount: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_sm,
        color: theme.colors.outline,
    },
    upvoteCountActive: {
        color: theme.colors.tertiary,
        fontWeight: theme.typography.weights.semibold,
    },
}));
