// ─── IUserService ─────────────────────────────────────────────
// OCP: extend with new methods without modifying consumers.
// DIP: screens and hooks depend on this interface, not the concrete class.

export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  bio: string;
  profilePicture: string;
  coverPicture: string;
  followers: string[];
  following: string[];
  posts: string[];
  createdAt: string;
}

export interface UserSearchResponse {
  users: User[];
}

export interface IUserService {
  /** Search users by query string. Requires a valid JWT token. */
  searchUsers(query: string, token: string): Promise<UserSearchResponse>;
}
