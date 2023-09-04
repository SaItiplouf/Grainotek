import {Injectable} from '@angular/core';
import {map, Observable} from "rxjs";
import {environnement} from "../../../environnement";
import {HttpClient} from "@angular/common/http";
import {IUser} from "../models/user.model";
import {IRoom, Room} from "../models/room.model";
import {IMessage} from "../models/message.model";

@Injectable({
  providedIn: 'root'
})
export class TradeService {
  isLoading: { [roomId: number]: boolean } = {};

  constructor(private http: HttpClient) {
  }

  createTrade(data: any): Observable<any> {
    return this.http.post(environnement.BASE_URL + "api/trades", data);
  }

  createMessage(messageContent: string, roomURI: string, userURI: string): Observable<IMessage> {
    const data = {
      room: roomURI,
      user: userURI,
      message: messageContent
    };
    return this.http.post<IMessage>(environnement.BASE_URL + `api/messages`, data);
  }

  getAllRoomsOfAUser(user: IUser): Observable<IRoom[]> {
    return this.http.get<any>(environnement.BASE_URL + `api/users/${user.id}/rooms`).pipe(
      map(response => {
        console.log(response); // Debugging: Log the entire response
        return this.mapToIRoom(response);
      })
    );
  }

  private mapToIRoom(data: any[]): Room[] {
    if (!data) {
      console.error('Data is undefined!');
      return [];
    }
    console.log('Raw data:', data);  // Logs raw data received

    const mappedRooms = data.map(roomData => {
      data.forEach(roomData => this.isLoading[roomData.id] = true);
      const room = new Room(roomData);
      console.log('Mapped Room:', room);  // Logs each Room after mapping
      return room;
    });

    return mappedRooms;
  }
}
