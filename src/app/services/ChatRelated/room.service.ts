import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {IPostRoom, IRoom, Room} from "../../models/room.model";
import {environnement} from "../../../environnement";
import {IUser} from "../../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  isLoading: { [roomId: number]: boolean } = {};

  constructor(private http: HttpClient) {
  }

  createRoom(data: IPostRoom): Observable<any> {
    return this.http.post<any>(environnement.BASE_URL + `api/rooms`, data);
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
