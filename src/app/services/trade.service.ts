import {Injectable} from '@angular/core';
import {map, Observable} from "rxjs";
import {environnement} from "../../../environnement";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {IUser} from "../models/user.model";
import {IRoom, Room} from "../models/room.model";
import {IMessage} from "../models/message.model";
import {ITrade} from "../models/trade.model";

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

  getAllTradeFromAUser(user: IUser): Observable<any> {
    return this.http.get(environnement.BASE_URL + `api/users/${user.id}/trade`);
  }

  createMessage(messageContent: string, roomURI: string, userURI: string): Observable<IMessage> {
    const data = {
      room: roomURI,
      user: userURI,
      message: messageContent
    };
    return this.http.post<IMessage>(environnement.BASE_URL + `api/messages`, data);
  }

  updateTradeStatut(trade: ITrade, statut: string): Observable<any> {
    trade.statut = statut;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/merge-patch+json'
      })
    };

    return this.http.patch(environnement.BASE_URL + `api/trade/${trade.id}/statut`, trade, httpOptions);
  }

  getAllRoomsOfAUser(user: IUser): Observable<IRoom[]> {
    return this.http.get<any>(environnement.BASE_URL + `api/users/${user.id}/rooms`).pipe(
      map(response => {
        console.log(response); // Debugging: Log the entire response
        return this.mapToIRoom(response);
      })
    );
  }

  markMessagesAsReadForUser(room: IRoom, user: IUser): Observable<void> {
    return this.http.get<void>(environnement.BASE_URL + `api/rooms/${room.id}/users/${user.id}/mark-as-read`, {});
  }

  private mapToIRoom(data: any[]): Room[] {
    console.log('Attempting to map to IRoom with data:', data);
    if (!data) {
      console.error('Data is undefined!');
      return [];
    }
    console.log('Raw data:', data);  // Logs raw data received

    const mappedRooms = data.map(roomData => {
      this.isLoading[roomData.id] = true;
      roomData.unreadCount = roomData.unreadCount || 0;
      const room = new Room(roomData);
      return room;
    });

    return mappedRooms;
  }
}
