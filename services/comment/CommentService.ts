/**
 * CommentService – HTTP implementation of ICommentService.
 *
 * SOLID:
 *  SRP : only maps comment API responses to the contract.
 *  DIP : depends on apiClient abstraction, not raw HTTP.
 *
 * Token injected transparently by apiClient interceptor.
 */

import { apiClient, ApiError } from '../http/apiClient';
import { Comment, CommentReply, ICommentService } from './ICommentService';

export class CommentService implements ICommentService {
  async addComment(postId: string, text: string): Promise<Comment> {
    try {
      const { data } = await apiClient.post(`/comment/create`, { postId, text });
      return data.comment;
    } catch (error: any) {
      console.error('CommentService.addComment:', error.message);
      throw error;
    }
  }

  async getPostComments(postId: string): Promise<Comment[]> {
    try {
      const { data } = await apiClient.get<Comment[]>(`/comment/post/${postId}`);
      return data;
    } catch (error: any) {
      console.error('CommentService.getPostComments:', error.message);
      throw error;
    }
  }

  async getReplies(commentId: string): Promise<CommentReply[]> {
    try {
      const { data } = await apiClient.get<{ replies: CommentReply[] } | CommentReply[]>(
        `/comment/replies/${commentId}`,
      );
      // API returns { replies: [...] } — unwrap it; fall back if plain array
      return Array.isArray(data) ? data : (data.replies ?? []);
    } catch (error: any) {
      console.error('CommentService.getReplies:', error.message);
      throw error;
    }
  }

  async likeComment(commentId: string): Promise<void> {
    try {
      await apiClient.post(`/comment/like/${commentId}`);
    } catch (error: any) {
      if (error instanceof ApiError && error.status === 409) return;
      console.error('CommentService.likeComment:', error.message);
      throw error;
    }
  }

  async dislikeComment(commentId: string): Promise<void> {
    try {
      await apiClient.post(`/comment/dislike/${commentId}`);
    } catch (error: any) {
      if (error instanceof ApiError && error.status === 409) return;
      console.error('CommentService.dislikeComment:', error.message);
      throw error;
    }
  }

  async likeReply(commentId: string, replyId: string): Promise<void> {
    try {
      await apiClient.post(`/comment/${commentId}/replies/like/${replyId}`);
    } catch (error: any) {
      if (error instanceof ApiError && error.status === 409) return;
      console.error('CommentService.likeReply:', error.message);
      throw error;
    }
  }

  async dislikeReply(commentId: string, replyId: string): Promise<void> {
    try {
      await apiClient.post(`/comment/${commentId}/replies/dislike/${replyId}`);
    } catch (error: any) {
      if (error instanceof ApiError && error.status === 409) return;
      console.error('CommentService.dislikeReply:', error.message);
      throw error;
    }
  }
}
