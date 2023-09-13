import {IUser} from "./user.model";
import {IPost} from "./post.model";
import {IPostCommentLike} from "./postcommentLike.model";

export interface IPostComment {
  id: number;
  user: IUser;
  post: IPost;
  content: string;
  createdAt: string;
  postCommentLikes: IPostCommentLike[]
}
