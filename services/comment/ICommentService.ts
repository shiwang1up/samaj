/**
 * ICommentService – contract for comment-domain API operations.
 *
 * OCP : extend with addComment, likeComment… without touching consumers.
 * DIP : screens/hooks depend on this interface, not CommentService.
 */

export interface CommentUser {
  _id: string;
  username: string;
  fullName: string;
  profilePicture: string;
}

export interface CommentReply {
  _id: string;
  user: CommentUser;
  text: string;
  likes: string[];
  createdAt: string;
}

export interface Comment {
  _id: string;
  user: CommentUser;
  post: string;
  text: string;
  likes: string[];
  replies: CommentReply[];
  createdAt: string;
}

export interface ICommentService {
  addComment(postId: string, text: string): Promise<Comment>;
  getPostComments(postId: string): Promise<Comment[]>;
  getReplies(commentId: string): Promise<CommentReply[]>;
  likeComment(commentId: string): Promise<void>;
  dislikeComment(commentId: string): Promise<void>;
  /** Toggle upvote on a reply. */
  likeReply(commentId: string, replyId: string): Promise<void>;
  /** Toggle downvote (remove upvote) on a reply. */
  dislikeReply(commentId: string, replyId: string): Promise<void>;
}
