/**
 * IUserService – contract for all user-domain API operations.
 *
 * OCP : extend with new methods (getProfile, follow, block…) without
 *       modifying this interface or its consumers.
 * DIP : screens and hooks depend on this interface, not UserService.
 *
 * Note: `token` is intentionally absent from all method signatures.
 *       Authentication is a cross-cutting concern handled by the HTTP
 *       layer (apiClient interceptor), not the service contract.
 */

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
  /** Search users by a partial name or username query. */
  searchUsers(query: string): Promise<UserSearchResponse>;
  /** Follow a user */
  followUser(userId: string): Promise<void>;
  /** Unfollow a user */
  unfollowUser(userId: string): Promise<void>;
  /** Get full user profile */
  getUser(userId: string): Promise<User>;
  /** Update user profile (text fields) */
  updateProfile( data: { fullName: string; bio: string }): Promise<User>;
  /** Update user profile picture */
  updateProfilePicture(formData: FormData): Promise<User>;
}
