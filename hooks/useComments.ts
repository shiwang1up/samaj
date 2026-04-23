/**
 * useComments – manages the post-comments async flow.
 *
 * SOLID:
 *  SRP : only responsible for comment fetch state.
 *  DIP : depends on ICommentService, injected by the screen.
 */

import { useCallback, useState } from 'react';
import { Comment, ICommentService } from '../services/comment/ICommentService';
import { useAuth } from './useAuth';

export const useComments = (commentService: ICommentService) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const fetchComments = useCallback(
    async (postId: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await commentService.getPostComments(postId);
        setComments(data);
      } catch (err: any) {
        setError(err.message ?? 'Failed to load comments');
      } finally {
        setLoading(false);
      }
    },
    [commentService],
  );

  const reset = useCallback(() => {
    setComments([]);
    setError(null);
  }, []);

  const addComment = useCallback(
    async (postId: string, text: string) => {
      const newComment = await commentService.addComment(postId, text);
      
      // API returns just an ID for the 'user' field on create. 
      // We manually construct the populated object using our cached active AuthUser.
      if ((typeof newComment.user === 'string' || !newComment.user) && user) {
          newComment.user = {
              _id: user._id,
              username: user.username,
              fullName: user.fullName,
              profilePicture: user.profilePicture ?? '',
          };
      }

      setComments((prev) => [newComment, ...prev]);
      return newComment;
    },
    [commentService, user]
  );

  return { comments, setComments, loading, error, fetchComments, reset, addComment };
};
