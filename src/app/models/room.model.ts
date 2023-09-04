import {IUser, User} from "./user.model";
import {IMessage, Message} from "./message.model";
import {ITrade} from "./trade.model";

export interface IRoom {
  id: number;
  name: string;
  users: IUser[];
  messages: IMessage[];
  trade: ITrade;
}

export class Room {
  id!: number;
  name!: string;
  users!: IUser[];  // changed this from user to users
  messages!: IMessage[];
  trade!: ITrade;

  constructor(data: any) {
    if (!data) {
      console.error('Data passed to Room constructor is undefined!');
      return;
    }
    this.id = data.id;
    this.name = data.name;
    this.users = data.users ? data.users.map((userData: any) => new User(userData)) : [];
    this.messages = data.messages ? data.messages.map((messageData: any) => new Message(messageData)) : [];
    this.trade = data.trade;
  }
}


