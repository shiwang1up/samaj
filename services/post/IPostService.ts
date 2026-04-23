/**
 * IPostService – contract for all post-domain API operations.
 *
 * OCP : extend with createPost, likePost, deletePost… without touching consumers.
 * DIP : screens and hooks depend on this interface, not PostService.
 *
 * Note: no token param — auth is a transport concern (apiClient interceptor).
 */

export interface PostAuthor {
  _id: string;
  username: string;
  fullName: string;
  profilePicture: string;
}

export interface Post {
  _id: string;
  user: PostAuthor;
  caption: string;
  image: string[];
  likes: string[];
  comments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PostsResponse {
  posts: Post[];
}

export interface ImageFile {
  uri: string;
  name: string;
  type: string;
}

export interface CreatePostPayload {
  userId: string;
  caption: string;
  images: ImageFile[];
}

export interface IPostService {
  getAllPosts(): Promise<PostsResponse>;
  likePost(postId: string): Promise<void>;
  dislikePost(postId: string): Promise<void>;
  createPost(payload: CreatePostPayload): Promise<Post>;
}
