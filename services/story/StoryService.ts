/**
 * StoryService – HTTP implementation of IStoryService.
 *
 * SOLID:
 *  SRP : handles API communication and data mapping for stories.
 *  LSP : satisfies IStoryService contract.
 *  DIP : depends on apiClient abstraction.
 */

import { apiClient } from "../http/apiClient";
import { IStoryService, Story } from "./IStoryService";

export class StoryService implements IStoryService {
  async getAllStories(): Promise<Story[]> {
    try {
      const { data } = await apiClient.get<Story[]>("/story/all");
      return data;
    } catch (error: any) {
      console.error("StoryService.getAllStories:", error.message);
      throw error;
    }
  }
}
