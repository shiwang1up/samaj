/**
 * PostService – HTTP implementation of IPostService.
 *
 * SOLID:
 *  SRP : only maps post API responses to the IPostService contract.
 *  OCP : add createPost(), likePost()… without touching getAllPosts().
 *  LSP : fully satisfies IPostService — drop-in replaceable.
 *  DIP : depends on apiClient abstraction, not raw HTTP details.
 *
 * Token is injected transparently by the apiClient request interceptor.
 */

import { apiClient, ApiError } from "../http/apiClient";
import { CreatePostPayload, IPostService, Post, PostsResponse } from "./IPostService";

export class PostService implements IPostService {
  async getAllPosts(): Promise<PostsResponse> {
    try {
      const { data } = await apiClient.get<PostsResponse>("/post/all");
      return data;
    } catch (error: any) {
      console.error("PostService.getAllPosts:", error.message);
      throw error;
    }
  }

  async likePost(postId: string): Promise<void> {
    try {
      await apiClient.post(`/post/like/${postId}`);
    } catch (error: any) {
      // 409 = already liked — optimistic state was correct, nothing to revert
      if (error instanceof ApiError && error.status === 409) return;
      console.error("PostService.likePost:", error.message);
      throw error;
    }
  }

  async dislikePost(postId: string): Promise<void> {
    try {
      await apiClient.post(`/post/dislike/${postId}`);
    } catch (error: any) {
      if (error instanceof ApiError && error.status === 409) return;
      console.error("PostService.dislikePost:", error.message);
      throw error;
    }
  }

  async createPost({ userId, caption, images }: CreatePostPayload): Promise<Post> {
    try {
      const formData = new FormData();
      if (caption.trim()) formData.append('caption', caption.trim());
      images.forEach((img) => {
        formData.append('images', {
          uri: img.uri,
          name: img.name,
          type: img.type,
        } as any);
      });
      const { data } = await apiClient.post<{ message: string; post: Post }>(
        `/post/create/${userId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return data.post;
    } catch (error: any) {
      console.error("PostService.createPost:", error.message);
      throw error;
    }
  }
}
