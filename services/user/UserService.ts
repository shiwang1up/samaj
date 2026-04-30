/**
 * UserService – HTTP implementation of IUserService.
 *
 * SOLID:
 *  SRP : only maps user API responses to the IUserService contract.
 *  OCP : add getProfile(), follow(), block()… without changing existing methods.
 *  LSP : fully satisfies IUserService.
 *  DIP : depends on apiClient abstraction, not raw HTTP details.
 *
 * Token injection is handled transparently by the apiClient request
 * interceptor — this service never touches auth concerns.
 */

import { apiClient } from "../http/apiClient";
import { IUserService, User, UserSearchResponse } from "./IUserService";

export class UserService implements IUserService {
  async searchUsers(query: string): Promise<UserSearchResponse> {
    try {
      const { data } = await apiClient.get<UserSearchResponse>(
        `/user/search/${encodeURIComponent(query)}`,
      );
      return data;
    } catch (error: any) {
      console.error("UserService.searchUsers:", error.message);
      throw error;
    }
  }

  async followUser(userId: string): Promise<void> {
    try {
      await apiClient.post(`/user/follow/${userId}`);
    } catch (error: any) {
      console.error("UserService.followUser:", error.message);
      throw error;
    }
  }

  async unfollowUser(userId: string): Promise<void> {
    try {
      await apiClient.post(`/user/unfollow/${userId}`);
    } catch (error: any) {
      console.error("UserService.unfollowUser:", error.message);
      throw error;
    }
  }

  async getUser(userId: string): Promise<User> {
    try {
      // API returns the user object at the root level: { _id, username, ... }
      const { data } = await apiClient.get<User>(`/user/${userId}`);
      return data;
    } catch (error: any) {
      console.error("UserService.getUser:", error.message);
      throw error;
    }
  }

  async updateProfile(payload: { fullName: string; bio: string }): Promise<User> {
    try {
      const { data } = await apiClient.put<{ message: string; user: User }>(
        `/user/update`,
        payload
      );
      return data.user || (data as any);
    } catch (error: any) {
      console.error("UserService.updateProfile:", error.message);
      throw error;
    }
  }

  async updateProfilePicture(formData: FormData): Promise<User> {
    try {
      const { data } = await apiClient.put<{ message: string; user: User }>(
        `/user/update-profile-picture`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data.user || (data as any);
    } catch (error: any) {
      console.error("UserService.updateProfilePicture:", error.message);
      throw error;
    }
  }
}
