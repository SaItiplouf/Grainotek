import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {IMessage} from "../../models/message.model";
import {environnement} from "../../../../environnement";
import {IRoom} from "../../models/room.model";
import {IUser} from "../../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(private http: HttpClient) {
  }

  createMessage(messageContent: string, roomURI: string, userURI: string): Observable<IMessage> {
    const data = {
      room: roomURI,
      user: userURI,
      message: messageContent
    };
    return this.http.post<IMessage>(environnement.BASE_URL + `api/messages`, data);
  }
  markMessagesAsReadForUser(room: IRoom, user: IUser): Observable<void> {
    const data = {
      room: room,
      user: user
    };
    console.log("data retourné :" , data)
    return this.http.post<void>(environnement.BASE_URL + `api/messages/mark-messages-as-read`, data);
  }

}
