import {IUser} from "./user.model";
import {ITrade} from "./trade.model";

export interface IUserReview {
  stars: number;
  user: IUser;
  targetedUser: IUser;
  trade: ITrade;
  note: string;
}
