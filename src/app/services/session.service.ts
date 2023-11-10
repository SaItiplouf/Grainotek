import {Injectable, NgZone, OnDestroy, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {map, Observable, Subject} from "rxjs";
import jwt_decode from 'jwt-decode';
import jwtDecode from 'jwt-decode';
import {IUser, User} from "../models/user.model";
import {environnement} from "../../environnement";
import {Store} from "@ngrx/store";
import {setUser} from "../actions/post.actions";
import {State} from "../Reducers/app.reducer";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import {EventSourcePolyfill} from "ng-event-source";
import {roomsLoaded, selectRoom, updateRoom} from "../actions/chat.actions";
import {RoomService} from "./ChatRelated/room.service";
import {IRoom, Room} from "../models/room.model";
import {IMessage} from "../models/message.model";

@Injectable({
  providedIn: 'root'
})
export class SessionService implements OnInit, OnDestroy{

  REGISTER_URL = 'register';
  LOGIN_URL = 'auth';
  BASE_URL: string = environnement.BASE_URL;
  userLoggedOut = new Subject<void>();
  userLoggedIn = new Subject<void>();
  private eventSource: EventSourcePolyfill | null = null;
  connectedUser!: IUser;
  private eventSourceAfter: EventSource | null = null;
  rooms!: IRoom[];
  selectedRoom!: IRoom;
  constructor(private HttpClient: HttpClient, private toastr: ToastrService,
              private router: Router,
              private http: HttpClient,
              private ngZone: NgZone,
              private roomService: RoomService,
              private store: Store<{
    state: State
  }>) {
  }

  ngOnInit() {

    this.store.select((state: any) => state.state.selectedRoom).subscribe((room: IRoom) => {
      this.selectedRoom = room
    });

  }
  ngOnDestroy(): void {
    // Fermez la connexion Mercure
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
  checkUserAuthentication() {
    if (!this.isTokenValid() || localStorage.getItem('jwt') === null) {
      this.router.navigate(['/']);
      this.toastr.error('Veuillez vous connecter', 'Erreur');
      this.forgetToken()
    }
  }

  // probleme d'opti

  // async getUserInfoFromAPI(user: IUser) {
  //   const token = localStorage.getItem('jwt');
  //
  //   if (token) {
  //     try {
  //       const response = await fetch(`${environnement.BASE_URL}api/users/${user.id}`, {
  //         method: 'GET',
  //         // headers: {
  //         //   'Authorization': `Bearer ${token}`
  //         // }
  //       });
  //
  //       if (response.ok) {
  //         const userData = await response.json();
  //
  //         const userInfoFromAPI = {
  //           id: userData.id,
  //           email: userData.email,
  //           roles: userData.roles,
  //           username: userData.username,
  //           pictureUrl: userData.pictureUrl,
  //         };
  //
  //         return userInfoFromAPI;
  //       } else {
  //         console.error("Erreur lors de la requête API :", response.status);
  //         return null;
  //       }
  //     } catch (error) {
  //       console.error("Erreur lors de la requête API :", error);
  //       return null;
  //     }
  //   } else {
  //     return null;
  //   }
  // }

  isTokenValid(): boolean {
    const decodedToken: any = this.decodeToken();
    if (decodedToken) {
      const currentTime = Math.floor(Date.now() / 1000);
      return decodedToken.exp >= currentTime;
    }
    return false;
  }


  register(formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'multipart/form-data'
    });

    return this.http.post<any>(`${this.BASE_URL}api/${this.REGISTER_URL}`, formData);
  }

  login(email: string, password: string): Observable<any> {
    return this.HttpClient.post<any>(`${this.BASE_URL}${this.LOGIN_URL}`, {email, password})
      .pipe(
        map(response => {
          if (response) {
            localStorage.setItem('jwt', JSON.stringify(response));
            console.log('JWT STORED');
            this.userLoggedIn.next();
            this.setUserFromToken();
            this.LoadUserRooms()
            // this.subscribeToUserTopic()
            return response;
          } else {
            console.log('JWT FAILED');
            throw new Error('JWT Failed');
          }
        })
      );
  }
  LoadUserRooms() {
    this.store.select((state: any) => state.state.user).subscribe((user: IUser) => {
      this.connectedUser = user
      this.roomService.getAllRoomsOfAUser(this.connectedUser).subscribe(rooms => {
        rooms.forEach(room => {
          room.unreadCount = room.messages.reduce((count, message) => {
            const isUnread = message.readed;
            const notFromCurrentUser = message.user.id !== this.connectedUser.id;
            if (isUnread && notFromCurrentUser) {
              return count + 1;
            }
            return count;
          }, 0);
        });
        this.store.dispatch(roomsLoaded({ rooms }));
        this.store.select(state => state.state.room).subscribe(rooms => {
          this.rooms = rooms || [];
          this.SetRecentRooms()
        });
      });
    });
    };

  SetRecentRooms() {
    console.log("coucou ET C UN TOUR DE MANAGE ENCORE NSM");
    if (this.rooms && this.rooms.length > 0) {
      const recentRoom = this.findMostRecentRoom();
      if (recentRoom) {
        console.log(recentRoom);
        this.store.dispatch(selectRoom({ room: recentRoom }));
      }
    } else {
      console.log("selected vide");
    }

    this.initializeMercureSubscription();
  }

  findMostRecentRoom(): IRoom | null {
    return this.rooms.reduce((mostRecent: IRoom | null, currentRoom: IRoom) => {
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

  private initializeMercureSubscription(): void {
      const mercureHubUrl = environnement.MERCURE_URL + `https://polocovoitapi.projets.garage404.com/api/users/${this.connectedUser?.id}/rooms`;

      this.eventSourceAfter = new EventSource(mercureHubUrl);

      this.eventSourceAfter.onopen = (event) => {
        console.log('Connection to Mercure opened successfully!', event);
      };

      this.eventSourceAfter.onmessage = (event) => {

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
        const notFromCurrentUser = message.user.id !== this.connectedUser?.id;

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


  subscribeToUserTopic(): void {
    const jwtFromLocalStorage = localStorage.getItem("jwt");
    if (!jwtFromLocalStorage) return;

    const decodedJwt: IUser = jwtDecode(jwtFromLocalStorage);
    const topicUrl = `user/${decodedJwt.id}`;
    const authorizationHeader = `Bearer ${jwtFromLocalStorage}`;
    const mercureHubUrl = environnement.MERCURE_URL + topicUrl;

    const headers = new Headers({
      'Authorization': authorizationHeader
    });

    this.eventSource = new EventSourcePolyfill(mercureHubUrl, {withCredentials: true, headers});

    this.eventSource.onopen = (event: any) => {
      console.log('Connection to Mercure opened successfully! USER SIDE', event);
    };

    this.eventSource.onmessage = (event: any) => {
      const data = JSON.parse(event.data);
      console.log('Received message from Mercure:', data);
    };
  }

  setUserFromToken() {
// Au login enregistrement dans le store
    const userInfo = this.getUserInfo();
    if (userInfo) {
      this.store.dispatch(setUser({user: userInfo}));
    }
  }

// FROM TOKEN
  getUserInfo(): IUser | null {
    const decodedToken: any = this.decodeToken();
    if (decodedToken) {
      const user: IUser = new User({
        id: decodedToken.id,
        email: decodedToken.email,
        roles: decodedToken.roles,
        username: decodedToken.username,
        pictureUrl: decodedToken.pictureUrl,
      });

      return user;
    }
    return null;
  }

  // erreur du passé
  // getSetLocalUserToClass(): User | null {
  //   const localUser = localStorage.getItem('localUser');
  //
  //   if (localUser) {
  //     const parsedLocalUser = JSON.parse(localUser);
  //     const user = new User(parsedLocalUser);
  //     return user;
  //   }
  //
  //   return null;
  // }

  isUserLoggedIn(): boolean {
    return !!localStorage.getItem('jwt');
  }

  forgetToken() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('localUser');
    this.router.navigate(['/']);
    this.userLoggedOut.next();
    if (this.eventSource) {
      this.eventSource.close();
    }
  }


  private decodeToken(): any {
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        return jwt_decode(token);
      } catch (error) {
        console.error("Erreur lors du décodage du token:", error);
      }
    }
    return null;
  }

}
