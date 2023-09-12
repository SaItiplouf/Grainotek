import {IUser, User} from "./user.model";
import {IRoom, Room} from "./room.model";

export interface IMessage {
  id: number;
  room: IRoom;
  user: IUser;
  message: string;
  createdAt: string;
  readed: boolean;
}

export class Message {
  id!: number;
  room!: IRoom;
  user!: IUser;
  message!: string;
  createdAt!: string;
  readed!: boolean;

  constructor(data: any) {
    if (!data) {
      console.error('Data passed to Message constructor is undefined!');
      return;
    }
    this.id = data.id;
    this.user = new User(data.user);
    this.room = new Room(data.room);
    this.message = data.message;
    this.createdAt = data.createdAt;
    this.readed = data.readed;
  }

}
