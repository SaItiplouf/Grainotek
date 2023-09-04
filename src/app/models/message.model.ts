import {IUser, User} from "./user.model";
import {IRoom} from "./room.model";

export interface IMessage {
  id: number;
  room: IRoom;
  user: IUser;
  message: string;
  createdAt: string;
}

export class Message {
  id!: number;
  room!: IRoom;
  user!: IUser;
  message!: string;
  createdAt!: string;

  constructor(data: any) {
    if (!data) {
      console.error('Data passed to Message constructor is undefined!');
      return;
    }
    this.id = data.id;
    this.user = new User(data.user);
    this.message = data.message;
    this.createdAt = data.createdAt;
  }

}
