import {IPostImage} from "./postimage.model";
import {IUser} from "./user.model";

export interface IPost {
  id: number;
  name: string;
  user: IUser;
  content: string;
  location: string;
  createdAt: string;
  images: IPostImage[];
}
