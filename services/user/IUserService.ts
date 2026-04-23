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
  searchUsers(query: string): Promise<UserSearchResponse>;
}
