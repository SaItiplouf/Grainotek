import {IUser, User} from "./user.model";
import {IMessage, Message} from "./message.model";
import {ITrade} from "./trade.model";

export interface IRoom {
  id: number;
  name: string;
  users: IUser[];
  messages: IMessage[];
  trade: ITrade;
  unreadCount: number;
}

export class Room {
  id!: number;
  name!: string;
  users!: IUser[];
  messages!: IMessage[];
  trade!: ITrade;
  unreadCount!: number;

  constructor(data: any) {
    if (!data) {
      console.error('Data passed to Room constructor is undefined!');
      return;
    }
    this.id = data.id;
    this.name = data.name;
    this.users = data.users ? data.users.map((userData: any) => userData as IUser) : [];
    this.messages = data.messages ? data.messages.map((messageData: any) => messageData as IMessage) : [];
    this.trade = data.trade;
    this.unreadCount = data.unreadCount || 0;
  }
}


