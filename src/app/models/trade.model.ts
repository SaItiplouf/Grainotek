import {IUser} from "./user.model";
import {IPost} from "./post.model";
import {IRoom} from "./room.model";


export interface ITrade {
  id: number;
  applicant: IUser;
  userPostOwner: IUser;
  post: IPost;
  statut: string;
  room: IRoom;
  createdAt: string;
}
