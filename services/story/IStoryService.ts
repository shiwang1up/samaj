/**
 * IStoryService – contract for story domain API operations.
 *
 * SOLID:
 *  OCP : extend with createStory, viewStory, etc. without touching consumers.
 *  DIP : screens depend on this interface, not StoryService.
 */

export interface StoryUser {
  _id: string;
  username: string;
  fullName: string;
  profilePicture?: string;
}

export interface Story {
  _id: string;
  user: StoryUser;
  text: string;
  image: string;
  createdAt: string;
}

export interface IStoryService {
  getAllStories(): Promise<Story[]>;
}
