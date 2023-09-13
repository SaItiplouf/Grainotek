import {IUser} from "./user.model";
import {IPostComment} from "./postcomment.model";

export interface IPostCommentLike {
  id: number,
  user: IUser,
  postcomment: IPostComment,
  liked: boolean
}
