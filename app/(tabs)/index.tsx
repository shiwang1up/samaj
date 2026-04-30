/**
 * HomeScreen (Feed)
 *
 * SOLID:
 *  SRP : composes UI only — no business logic.
 *  DIP : PostService injected at composition root; hook depends on IPostService.
 *  OCP : add more feed sections without touching fetch logic.
 */

import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { TopBar }                from '../../components/common/TopBar';
import { CommentsBottomSheet }   from '../../components/feed/CommentsBottomSheet';
import { PostImageCarousel }     from '../../components/feed/PostImageCarousel';
import { StoryReel }             from '../../components/feed/StoryReel';
import { StoryViewerModal }      from '../../components/feed/StoryViewerModal';
import { ScopeTabs }             from '../../components/feed/ScopeTabs';

import { Config }             from '../../constants/Config';
import { useAuth }            from '../../hooks/useAuth';
import { useComments }        from '../../hooks/useComments';
import { useFeedScope }       from '../../hooks/useFeedScope';
import { useLogout }          from '../../hooks/useLogout';
import { usePosts }           from '../../hooks/usePosts';
import { useStories }         from '../../hooks/useStories';
import { CommentService }     from '../../services/comment/CommentService';
import { PostService }        from '../../services/post/PostService';
import { StoryService }       from '../../services/story/StoryService';
import { Post }               from '../../services/post/IPostService';
import { Story }              from '../../services/story/IStoryService';

// ── Composition root ──────────────────────────────────────────
const postService    = new PostService();
const commentService = new CommentService();
const storyService   = new StoryService();

// ── Helpers ───────────────────────────────────────────────────
// resolveImageUrl no longer needed in screen — PostImageCarousel handles it

const timeAgo = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (days  > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins  > 0) return `${mins}m ago`;
    return 'just now';
};

// ── Post card ─────────────────────────────────────────────────
interface PostCardProps {
    post: Post;
    currentUserId: string;
    onUpvote: (postId: string, isLiked: boolean) => void;
    onCommentPress: (postId: string, commentCount: number) => void;
}

function PostCard({ post, currentUserId, onUpvote, onCommentPress }: PostCardProps) {
    const avatarUri = post.user.profilePicture?.includes('localhost')
        ? post.user.profilePicture.replace('localhost', Config.HOST)
        : post.user.profilePicture || null;
    const isUpvoted = post.likes.includes(currentUserId);

    return (
        <View style={cardStyles.card}>
            {/* Author row */}
            <View style={cardStyles.authorRow}>
                {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={cardStyles.avatar} />
                ) : (
                    <View style={[cardStyles.avatar, cardStyles.avatarFallback]}>
                        <Text style={cardStyles.avatarInitial}>
                            {post.user.fullName?.[0]?.toUpperCase() ?? '?'}
                        </Text>
                    </View>
                )}
                <View style={cardStyles.authorMeta}>
                    <Text style={cardStyles.authorName}>{post.user.fullName}</Text>
                    <Text style={cardStyles.authorHandle}>
                        @{post.user.username} · {timeAgo(post.createdAt)}
                    </Text>
                </View>
            </View>

            {/* Caption */}
            {!!post.caption && (
                <Text style={cardStyles.caption}>{post.caption}</Text>
            )}

            {/* Images carousel */}
            <PostImageCarousel images={post.image} />

            {/* Footer */}
            <View style={cardStyles.footer}>
                {/* Upvote toggle */}
                <TouchableOpacity
                    style={[cardStyles.voteBtn, isUpvoted && cardStyles.voteBtnActive]}
                    onPress={() => onUpvote(post._id, isUpvoted)}
                    activeOpacity={0.7}
                >
                    <Text style={[cardStyles.voteArrow, isUpvoted && cardStyles.voteArrowActive]}>
                        ▲
                    </Text>
                    <Text style={[cardStyles.voteCount, isUpvoted && cardStyles.voteCountActive]}>
                        {post.likes.length}
                    </Text>
                </TouchableOpacity>

                {/* Comments */}
                <TouchableOpacity
                    style={cardStyles.stat}
                    onPress={() => onCommentPress(post._id, post.comments.length)}
                    activeOpacity={0.7}
                >
                    <Text style={cardStyles.statIcon}>💬</Text>
                    <Text style={cardStyles.statCount}>{post.comments.length}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ── Screen ────────────────────────────────────────────────────
export default function HomeScreen() {
    const { theme }                        = useUnistyles();
    const router                           = useRouter();
    const { logout }                       = useLogout();
    const { token }                        = useAuth();
    const { scopes, activeScope, setScope } = useFeedScope();
    const { posts, setPosts, loading, error, refetch }   = usePosts(postService);
    const { comments, setComments, loading: commentsLoading, error: commentsError,
            fetchComments, reset: resetComments, addComment }         = useComments(commentService);
    const { stories: rawStories, loading: storiesLoading, refetch: refetchStories } = useStories(storyService);

    // Story viewer state
    const [activeStoryGroup, setActiveStoryGroup] = useState<Story[] | null>(null);
    const [viewedStories, setViewedStories]       = useState<Set<string>>(new Set());

    // Group stories by user and map to IStory format
    const { stories, groupedStoriesMap } = React.useMemo(() => {
        const groups: Record<string, Story[]> = {};
        for (const s of rawStories) {
            const uid = s.user?._id || 'unknown';
            if (!groups[uid]) groups[uid] = [];
            groups[uid].push(s);
        }

        const reelStories = Object.values(groups).map((group, index) => {
            const s = group[0]; // Representative story for the user circle
            const colors = ['#E57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB', '#64B5F6'];
            let colorIndex = index % colors.length;
            if (s.user?._id) {
                let hash = 0;
                for (let i = 0; i < s.user._id.length; i++) {
                    hash = s.user._id.charCodeAt(i) + ((hash << 5) - hash);
                }
                colorIndex = Math.abs(hash) % colors.length;
            }

            const avatarUri = s.user?.profilePicture?.includes('localhost')
                ? s.user.profilePicture.replace('localhost', Config.HOST)
                : s.user?.profilePicture || undefined;

            const hasUnseen = group.some((st) => !viewedStories.has(st._id));

            return {
                id: s.user?._id || s._id,
                label: s.user?.username || 'Unknown',
                initial: (s.user?.fullName || s.user?.username || '?').charAt(0).toUpperCase(),
                avatarColor: colors[colorIndex],
                hasUnseen,
                imageUri: avatarUri
            };
        });

        return { stories: reelStories, groupedStoriesMap: groups };
    }, [rawStories, viewedStories]);

    const handleRefetch = useCallback(() => {
        refetch();
        refetchStories();
    }, [refetch, refetchStories]);

    // Comments sheet state
    const [activePostId, setActivePostId]       = useState<string | null>(null);
    const [activeCommentCount, setActiveCount]  = useState(0);

    // Decode current userId from JWT for optimistic upvote highlight
    // JWT payload: { _id, tokenVersion, iat, exp }
    const currentUserId: string = (() => {
        try {
            if (!token) return '';
            return JSON.parse(atob(token.split('.')[1]))._id ?? '';
        } catch { return ''; }
    })();

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    // ▲ Toggle — like if not liked, dislike (remove) if already liked
    const handleUpvote = useCallback(async (postId: string, isLiked: boolean) => {
        setPosts((prev) =>
            prev.map((p) => {
                if (p._id !== postId) return p;
                return {
                    ...p,
                    likes: isLiked
                        ? p.likes.filter((id) => id !== currentUserId)
                        : [...p.likes, currentUserId],
                };
            }),
        );
        try {
            if (isLiked) {
                await postService.dislikePost(postId); // remove like
            } else {
                await postService.likePost(postId);    // add like
            }
        } catch {
            refetch(); // revert on any real error
        }
    }, [currentUserId, refetch, setPosts]);

    // Open comments sheet
    const handleCommentPress = useCallback((postId: string, count: number) => {
        setActivePostId(postId);
        setActiveCount(count);
        fetchComments(postId);
    }, [fetchComments]);

    // Close comments sheet
    const handleCloseSheet = useCallback(() => {
        setActivePostId(null);
        resetComments();
    }, [resetComments]);

    // Add comment
    const handleAddComment = useCallback(async (text: string) => {
        if (!activePostId) return;
        try {
            await addComment(activePostId, text);
            setActiveCount((c) => c + 1);
            setPosts((prev) =>
                prev.map((p) => {
                    if (p._id !== activePostId) return p;
                    return {
                        ...p,
                        // Hacky way to bump length, but since we only care about length it works
                        comments: [...p.comments, 'temp_id' as any],
                    };
                })
            );
        } catch {
            alert('Failed to post comment');
        }
    }, [activePostId, addComment, setPosts]);

    // Comment upvote toggle (same optimistic pattern as post upvote)
    const handleCommentUpvote = useCallback(async (commentId: string, isUpvoted: boolean) => {
        setComments((prev) =>
            prev.map((c) => {
                if (c._id !== commentId) return c;
                return {
                    ...c,
                    likes: isUpvoted
                        ? c.likes.filter((id) => id !== currentUserId)
                        : [...c.likes, currentUserId],
                };
            }),
        );
        try {
            if (isUpvoted) {
                await commentService.dislikeComment(commentId);
            } else {
                await commentService.likeComment(commentId);
            }
        } catch {
            // Revert on failure — refetch comments for the active post
            if (activePostId) fetchComments(activePostId);
        }
    }, [currentUserId, setComments, activePostId, fetchComments]);

    // Fetch replies for a comment (passed to CommentsBottomSheet → CommentRow)
    const handleFetchReplies = useCallback(
        (commentId: string) => commentService.getReplies(commentId),
        [],
    );

    // Reply like/dislike — CommentRow handles optimistic state, we just hit the API
    const handleReplyUpvote = useCallback(
        async (commentId: string, replyId: string, isUpvoted: boolean): Promise<void> => {
            if (isUpvoted) {
                await commentService.dislikeReply(commentId, replyId);
            } else {
                await commentService.likeReply(commentId, replyId);
            }
        },
        [],
    );

    const ListHeader = (
        <>
            {/* Stories */}
            <StoryReel
                stories={stories}
                onAddStory={() => console.log('add story')}
                onStoryPress={(s) => {
                    const group = groupedStoriesMap[s.id];
                    if (group && group.length > 0) {
                        setActiveStoryGroup(group);
                    }
                }}
            />

            {/* Page title */}
            <View style={styles.pageTitleBlock}>
                <Text style={[styles.pageTitle, { color: theme.colors.on_surface }]}>
                    Community Feed
                </Text>
                <Text style={[styles.pageSubtitle, { color: theme.colors.on_surface_variant }]}>
                    Local issues, updates, and civic engagement.
                </Text>
            </View>

            {/* Scope tabs */}
            <ScopeTabs
                scopes={scopes}
                activeScope={activeScope}
                onSelect={setScope}
            />
        </>
    );

    if (loading) {
        return (
            <View style={styles.root}>
                <TopBar onAvatarPress={handleLogout} />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.stateText, { color: theme.colors.on_surface_variant }]}>
                        Loading feed…
                    </Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.root}>
                <TopBar onAvatarPress={handleLogout} />
                <View style={styles.centered}>
                    <Text style={[styles.stateText, { color: theme.colors.error }]}>
                        {error}
                    </Text>
                    <TouchableOpacity
                        style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]}
                        onPress={refetch}
                    >
                        <Text style={[styles.retryText, { color: theme.colors.on_primary }]}>
                            Retry
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <TopBar onAvatarPress={handleLogout} />
            <FlatList
                data={posts}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        currentUserId={currentUserId}
                        onUpvote={handleUpvote}
                        onCommentPress={handleCommentPress}
                    />
                )}
                ListHeaderComponent={ListHeader}
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={loading || storiesLoading}
                        onRefresh={handleRefetch}
                        tintColor={theme.colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text style={[styles.stateText, { color: theme.colors.on_surface_variant }]}>
                            No posts yet.
                        </Text>
                    </View>
                }
            />

            {/* Comments bottom sheet */}
            <CommentsBottomSheet
                visible={activePostId !== null}
                totalCount={activeCommentCount}
                comments={comments}
                loading={commentsLoading}
                error={commentsError}
                currentUserId={currentUserId}
                onCommentUpvote={handleCommentUpvote}
                onFetchReplies={handleFetchReplies}
                onReplyUpvote={handleReplyUpvote}
                onAddComment={handleAddComment}
                onClose={handleCloseSheet}
            />

            {/* Story Viewer Modal */}
            <StoryViewerModal
                visible={activeStoryGroup !== null}
                userStories={activeStoryGroup}
                onClose={() => setActiveStoryGroup(null)}
                onStoryViewed={(storyId) => {
                    setViewedStories(prev => {
                        if (prev.has(storyId)) return prev;
                        const next = new Set(prev);
                        next.add(storyId);
                        return next;
                    });
                }}
            />
        </View>
    );
}

// ── Screen styles ─────────────────────────────────────────────
const styles = StyleSheet.create((theme) => ({
    root: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    scroll: {
        paddingBottom: theme.spacing['3xl'],
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.base,
        paddingTop: theme.spacing['5xl'],
    },
    stateText: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_md,
    },
    retryBtn: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radius.xl,
    },
    retryText: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_lg,
        fontWeight: theme.typography.weights.semibold,
    },
    pageTitleBlock: {
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: theme.spacing.base,
        gap: 4,
    },
    pageTitle: {
        fontFamily: theme.typography.fonts.display,
        fontSize: theme.typography.sizes.headline_md,
        fontWeight: theme.typography.weights.extrabold,
        letterSpacing: theme.typography.tracking.headline,
    },
    pageSubtitle: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_sm,
    },
}));

// ── PostCard styles (Sentinel tokens) ─────────────────────────
const cardStyles = StyleSheet.create((theme) => ({
    card: {
        backgroundColor: theme.colors.surface_container_lowest,
        marginHorizontal: theme.spacing.xl,
        marginBottom: theme.spacing.base,
        borderRadius: theme.radius['2xl'],
        paddingTop: theme.spacing.base,
        borderWidth: theme.ghostBorder.borderWidth,
        borderColor: theme.ghostBorder.borderColor,
        overflow: 'hidden',
        ...theme.elevation[1],
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.base,
        marginBottom: theme.spacing.sm,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: theme.radius.full,
        marginRight: theme.spacing.sm,
    },
    avatarFallback: {
        backgroundColor: theme.colors.secondary_container,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontFamily: theme.typography.fonts.display,
        fontSize: theme.typography.sizes.title_sm,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.on_secondary_container,
    },
    authorMeta: {
        flex: 1,
    },
    authorName: {
        fontFamily: theme.typography.fonts.display,
        fontSize: theme.typography.sizes.title_sm,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.on_surface,
    },
    authorHandle: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_sm,
        color: theme.colors.outline,
        marginTop: 1,
    },
    caption: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.body_md,
        color: theme.colors.on_surface,
        lineHeight: theme.typography.sizes.body_md * theme.typography.leading.body,
        paddingHorizontal: theme.spacing.base,
        marginBottom: theme.spacing.sm,
    },
    postImage: {
        width: '100%',
        height: 220,
        marginBottom: theme.spacing.sm,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.base,
        paddingVertical: theme.spacing.sm,
        gap: theme.spacing.base,
        borderTopWidth: theme.ghostBorder.borderWidth,
        borderTopColor: theme.ghostBorder.borderColor,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statIcon: {
        fontSize: 14,
        color: theme.colors.outline,
    },
    statCount: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_md,
        color: theme.colors.on_surface_variant,
        fontWeight: theme.typography.weights.medium,
    },
    // Vote buttons
    voteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 4,
        borderRadius: theme.radius.full,
        backgroundColor: 'transparent',
    },
    voteBtnActive: {
        backgroundColor: theme.colors.tertiary_container,
    },
    voteArrow: {
        fontSize: 13,
        color: theme.colors.outline,
    },
    voteArrowActive: {
        color: theme.colors.tertiary,
    },
    voteCount: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_md,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.on_surface_variant,
    },
    voteCountActive: {
        color: theme.colors.tertiary,
    },
    extraImages: {
        fontFamily: theme.typography.fonts.body,
        fontSize: theme.typography.sizes.label_sm,
        color: theme.colors.primary,
        marginLeft: 'auto',
    },
}));
