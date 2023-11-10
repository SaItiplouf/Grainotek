import {Injectable, NgZone, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {IPostRoom, IRoom, Room} from "../../models/room.model";
import {environnement} from "../../../environnement";
import {IUser} from "../../models/user.model";
import {roomsLoaded, selectRoom, updateRoom} from "../../actions/chat.actions";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import {Store} from "@ngrx/store";
import {State} from "../../Reducers/app.reducer";
import {logos} from "@igniteui/material-icons-extended";
import {tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class RoomService implements OnInit{
  isLoading: { [roomId: number]: boolean } = {};
  private eventSource: EventSource | null = null;
  selectedRoom!: IRoom;
  rooms!: IRoom[];
  currentUser!: IUser;

  constructor(private http: HttpClient,
              private ngZone: NgZone,
              private store: Store<{ state: State }>
  ) {
  }

  ngOnInit() {
    this.store.select((state: any) => state.state.user).subscribe((user: IUser) => {
      this.currentUser = user
      console.log("ppl state user service room", user)
    });
    this.store.select((state: any) => state.state.selectedRoom).subscribe((room: IRoom) => {
      this.selectedRoom = room
      console.log("ppl state rooms service room", room)

    });
    this.store.select(state => state.state.room).subscribe(rooms => {
      this.rooms = rooms || [];
    });

  }

  createRoom(data: IPostRoom): Observable<any> {
    return this.http.post<any>(environnement.BASE_URL + `api/rooms`, data);
  }
  chatWithUser(user: IUser, targetUser: IUser) {
    return this.http.get<any>(environnement.BASE_URL + `api/check/user/${user.id}/targetuserid/${targetUser.id}`);
  }

  getAllRoomsOfAUser(user: IUser): Observable<IRoom[]> {
    return this.http.get<any>(environnement.BASE_URL + `api/users/${user.id}/rooms`).pipe(
      map(response => this.mapToIRoom(response)),
      tap(rooms => this.processRooms(rooms, user))
    );
  }

  private processRooms(rooms: Room[], user: IUser): void {
    console.log("coucou ET C UN TOUR DE MANAGE ENCORE NSM", rooms);

    if (rooms && rooms.length > 0) {
      const recentRoom = this.findMostRecentRoom(rooms);
      if (recentRoom) {
        console.log(recentRoom);
        this.store.dispatch(selectRoom({room: recentRoom}));
      } else {
        console.log("selected vide");
      }
      this.store.dispatch(roomsLoaded({rooms}));

      // Assurez-vous que this.currentUser est défini avant d'appeler initializeMercureSubscription
      if (user) {
        this.initializeMercureSubscription(user);
      } else {
        console.log("THIS USERRR est null");
      }
    }
  }
  private mapToIRoom(data: any[]): Room[] {
    console.log('Attempting to map to IRoom with data:', data);
    if (!data) {
      console.error('Data is undefined!');
      return [];
    }

    const mappedRooms = data.map(roomData => {
      this.isLoading[roomData.id] = true;
      roomData.unreadCount = roomData.unreadCount || 0;
      const room = new Room(roomData);

      // Ajouter le code pour mettre à jour unreadCount
      room.unreadCount = room.messages.reduce((count, message) => {
        const isUnread = message && message.readed;
        const notFromCurrentUser = message && message.user && message.user.id !== this.currentUser?.id;

        if (isUnread && notFromCurrentUser) {
          return count + 1;
        }
        return count;
      }, 0);

      return room;
    });

    mappedRooms.sort((a, b) => {
      const lastMessageA = a.messages?.length ? Date.parse(a.messages[a.messages.length - 1].createdAt) : null;
      const lastMessageB = b.messages?.length ? Date.parse(b.messages[b.messages.length - 1].createdAt) : null;

      if (lastMessageA === null && lastMessageB === null) {
        return 0;
      } else if (lastMessageA === null) {
        return 1;
      } else if (lastMessageB === null) {
        return -1;
      }

      return lastMessageB - lastMessageA;
    });

    return mappedRooms;
  }

  private findMostRecentRoom(rooms: Room[]): Room | null {
    return rooms.reduce((mostRecent: IRoom | null, currentRoom: IRoom) => {
      const lastMessageMostRecent = mostRecent ? mostRecent.messages[mostRecent.messages.length - 1] : null;
      const lastMessageCurrent = currentRoom.messages[currentRoom.messages.length - 1];

      if (!lastMessageMostRecent && !lastMessageCurrent) {
        return null;
      } else if (!lastMessageMostRecent) {
        return currentRoom;
      } else if (!lastMessageCurrent) {
        return mostRecent;
      }

      const timeMostRecent = new Date(lastMessageMostRecent.createdAt).getTime();
      const timeCurrent = new Date(lastMessageCurrent.createdAt).getTime();

      return timeCurrent > timeMostRecent ? currentRoom : mostRecent;
    }, null);
  }

  private initializeMercureSubscription(user: IUser): void {
    const mercureHubUrl = environnement.MERCURE_URL + `https://polocovoitapi.projets.garage404.com/api/users/${user.id}/rooms`;

    this.eventSource = new EventSource(mercureHubUrl);

    this.eventSource.onopen = (event) => {
      console.log('Connection to Mercure opened successfully!', event);
    };

    this.eventSource.onmessage = (event) => {

      this.ngZone.run(() => {
        const data = JSON.parse(event.data);
        console.log('Parsed data:', data);

        if (data) {
          // Define the room data adhering to the IRoom interface
          const dataRoom: IRoom = {
            unreadCount: 0,
            id: data.id,
            name: data.name,
            trade: data.trade,
            users: data.users.map((userData: any) => ({
              id: userData.id,
              email: userData.email,
              roles: userData.roles,
              username: userData.username,
              pictureUrl: userData.pictureUrl,
            })),
            messages: data.messages.map((messageData: any) => ({
              readed: messageData.readed,
              id: messageData.id,
              createdAt: messageData.createdAt,
              message: messageData.content,
              user: {
                id: messageData.user.id,
                email: messageData.user.email,
                roles: messageData.user.roles,
                username: messageData.user.username,
                pictureUrl: messageData.user.pictureUrl,
              }
            })),
          };

          console.log(dataRoom);

          // Update the messages of the appropriate room
          this.updateRoomMessages(dataRoom);
        }
      });
    };
  }
  updateRoomMessages(updatedRoom: Room): void {
    if (!updatedRoom || !updatedRoom.id) return;

    // Recherche de la salle par ID
    const roomToUpdate = this.rooms.find(room => room.id === updatedRoom.id);

    if (!roomToUpdate) return; // S'il n'y a pas de salle avec cet ID, sortir de la fonction

    // Copie de la salle à mettre à jour pour éviter les modifications directes
    const roomToUpdateCopy = { ...roomToUpdate };


    // Fusion des messages existants avec les nouveaux
    const currentRoomMessages = roomToUpdateCopy.messages || [];
    const newMessages = updatedRoom.messages.filter(
      updatedMsg => !currentRoomMessages.some(currMsg => currMsg.id === updatedMsg.id)
    );
    roomToUpdateCopy.messages = [...currentRoomMessages, ...newMessages];


    // Adjuster uniquement unreadCount si ce n'est pas la selectedRoom
    if (!(this.selectedRoom && this.selectedRoom.id === updatedRoom.id)) {
      roomToUpdateCopy.unreadCount! += newMessages.reduce((count, message) => {
        // Vérifiez si le message n'a pas été lu
        const isUnread = message.readed;

        // Vérifiez si le message n'est pas de l'utilisateur actuel
        const notFromCurrentUser = message.user.id !== this.currentUser?.id;

        if (isUnread && notFromCurrentUser) {
          return count + 1;
        }
        return count;
      }, 0);
    }


    // Dispatch l'action pour mettre à jour la room dans le store
    this.store.dispatch(updateRoom({ room: roomToUpdateCopy }));

    // Mise à jour de la salle sélectionnée si nécessaire
    if (this.selectedRoom && this.selectedRoom.id === updatedRoom.id) {
      this.selectedRoom = {
        ...this.selectedRoom,
        messages: roomToUpdateCopy.messages,
        unreadCount: roomToUpdateCopy.unreadCount
      };
    }
  }


}
