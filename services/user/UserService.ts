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
import { IUserService, UserSearchResponse } from "./IUserService";

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
}
