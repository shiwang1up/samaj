/**
 * usePosts – manages the feed posts async flow.
 *
 * SOLID:
 *  SRP : only responsible for fetching posts (loading / error / data).
 *  DIP : depends on IPostService interface, injected by the screen.
 */

import { useCallback, useEffect, useState } from "react";
import { Post, IPostService } from "../services/post/IPostService";

export const usePosts = (postService: IPostService) => {
  const [posts, setPosts]     = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await postService.getAllPosts();
      setPosts(response.posts);
    } catch (err: any) {
      setError(err.message ?? "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [postService]);

  // Fetch on mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, setPosts, loading, error, refetch: fetchPosts };
};
