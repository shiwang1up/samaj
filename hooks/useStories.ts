/**
 * useStories – manages the story async flow.
 *
 * SOLID:
 *  SRP : only responsible for fetching stories (loading / error / data).
 *  DIP : depends on IStoryService interface, injected by the screen.
 */

import { useCallback, useEffect, useState } from "react";
import { Story, IStoryService } from "../services/story/IStoryService";

export const useStories = (storyService: IStoryService) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await storyService.getAllStories();
      setStories(response);
    } catch (err: any) {
      setError(err.message ?? "Failed to load stories");
    } finally {
      setLoading(false);
    }
  }, [storyService]);

  // Fetch on mount
  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  return { stories, setStories, loading, error, refetch: fetchStories };
};
