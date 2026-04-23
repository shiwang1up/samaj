import { Config } from "../../constants/Config";
import { IUserService, UserSearchResponse } from "./IUserService";

export class UserService implements IUserService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = Config.USER_API_BASE_URL;
  }

  async searchUsers(query: string): Promise<UserSearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/search/${query}`);

      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("UserService searchUsers failed:", error);
      throw error;
    }
  }
}
