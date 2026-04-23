/**
 * UserService – concrete HTTP implementation of IUserService.
 *
 * SOLID:
 *  SRP: only handles user-related API calls.
 *  OCP: add new methods (getProfile, follow…) without touching existing ones.
 *  LSP: fully satisfies IUserService contract.
 *  DIP: depends on Config, not on any framework concern.
 */

import { Config } from "../../constants/Config";
import { IUserService, UserSearchResponse } from "./IUserService";

export class UserService implements IUserService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = Config.USER_API_BASE_URL;
  }

  async searchUsers(query: string, token: string): Promise<UserSearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/search/${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Search failed with status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("UserService.searchUsers failed:", error);
      throw error;
    }
  }
}
