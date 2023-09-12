import {AfterViewChecked, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {State} from "../../../Reducers/app.reducer";
import {Store} from "@ngrx/store";
import {AppService} from "../../../services/app.service";
import {IRoom, Room} from "../../../models/room.model";
import {TradeService} from "../../../services/trade.service";
import {roomsLoaded} from "../../../actions/chat.actions";
import {SessionService} from "../../../services/session.service";
import {IUser, User} from "../../../models/user.model";
import {Message} from "../../../models/message.model";

@Component({
  selector: 'app-chat-parent',
  templateUrl: './chat-parent.component.html',
  styleUrls: ['./chat-parent.component.scss']
})
export class ChatParentComponent implements OnInit, OnDestroy, AfterViewChecked {
  rooms: IRoom[] = [];
  selector: string = ".main-panel";
  currentPage: number = 1;
  currentUser!: User | null;
  selectedRoom: IRoom | null = null;
  newMessageContent: string = '';
  private eventSource: EventSource | null = null;
  @ViewChild('messageList') private messageListRef!: ElementRef;


  constructor(
    private store: Store<{ state: State }>,
    private tradeService: TradeService,
    private ngZone: NgZone,
    private appService: AppService,
    private sessionService: SessionService) {
  }

  get isLoading() {
    return this.tradeService.isLoading;
  }

  getLastMessage(room: IRoom): Message | null {
    return room.messages.length > 0 ? room.messages[room.messages.length - 1] : null;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    const messageList: HTMLDivElement = this.messageListRef.nativeElement;
    messageList.scrollTop = messageList.scrollHeight;
  }

  // onScroll() {
  //   this.TradeService.getAllRoomsOfAUser(this.currentPage + 1).subscribe(newRooms => {
  //     this.store.dispatch(roomsLoaded({room: [...this.rooms, ...newRooms]}));
  //     this.currentPage++; // Incrémentez la page actuelle
  //   });
  handleImageError(room: IRoom): void {
    console.log(`Image error for room ${room.id}`);
    this.isLoading[room.id] = false;
  }

  handleImageLoad(room: IRoom): void {
    console.log(`Image loaded for room ${room.id}`);
    this.isLoading[room.id] = false;
  }


  sendMessage(): void {
    if (this.newMessageContent.trim() && this.selectedRoom && this.currentUser) {
      const {id: roomId} = this.selectedRoom;
      const {id: userId} = this.currentUser;
      this.tradeService.createMessage(this.newMessageContent, `/api/rooms/${roomId}`, `/api/users/${userId}`)
        .subscribe(
          () => this.newMessageContent = '',
          error => console.error('Error sending message:', error)
        );
    }
  }

  selectRoom(room: IRoom): void {
    this.selectedRoom = room;

    if (room.messages.some(message => message.hasNewMessage)) {
      this.tradeService.markMessagesAsReadForUser(room, this.currentUser!).subscribe(
        () => {
          // Mark all messages in the selected room as read in the local state
          const updatedRoom = {...room};
          updatedRoom.messages = room.messages.map(message => {
            return {...message, hasNewMessage: false};
          });
          this.updateLocalRoomState(updatedRoom);
        },
        error => console.error('Error updating messages:', error)
      );
    }
  }

  handleImageStatus(room: IRoom, status: 'error' | 'load'): void {
    console.log(`Image ${status} for room ${room.id}`);
    this.isLoading[room.id] = false;
  }

  ngOnInit(): void {
    this.currentUser = this.sessionService.getSetLocalUserToClass();
    this.loadRoomsForCurrentUser();
    this.subscribeToRoomChanges()
    this.sessionService.checkUserAuthentication();
    this.sessionService.userLoggedOut.subscribe(() => {
      this.sessionService.checkUserAuthentication();
    });
  }

  ngOnDestroy(): void {
    // Fermez la connexion lors de la destruction du composant.
    if (this.eventSource) {
      this.eventSource.close();
    }
  }

  getRecipient(room: IRoom): IUser | null {
    return room.users.find(user => user.id !== this.currentUser?.id) || null;
  }

  updateRoomMessages(updatedRoom: Room): void {
    if (!updatedRoom || !updatedRoom.id) return;

    const roomIndex = this.rooms.findIndex(room => room.id === updatedRoom.id);
    if (roomIndex === -1) return;

    const roomToUpdate = {...this.rooms[roomIndex]};

    // Fusion des messages existants avec les nouveaux
    const currentRoomMessages = roomToUpdate.messages || [];
    const newMessages = updatedRoom.messages.filter(
      updatedMsg => !currentRoomMessages.some(currMsg => currMsg.id === updatedMsg.id)
    );

    roomToUpdate.messages = [...currentRoomMessages, ...newMessages];

    // Compter les messages non lus
    roomToUpdate.unreadCount = roomToUpdate.messages.reduce((count, message) =>
        count + (message.hasNewMessage && message.user.id !== this.currentUser?.id ? 1 : 0),
      0
    );

    // Update rooms without direct mutation
    this.rooms = this.rooms.map((room, index) => index === roomIndex ? roomToUpdate : room);

    // Mise à jour de la salle sélectionnée si nécessaire
    if (this.selectedRoom && this.selectedRoom.id === updatedRoom.id) {
      this.selectedRoom = {
        ...this.selectedRoom,
        messages: this.rooms[roomIndex].messages,
        unreadCount: roomToUpdate.unreadCount
      };
    }

    console.log(this.rooms);
  }

  private updateLocalRoomState(updatedRoom: IRoom): void {
    const roomIndex = this.rooms.findIndex(room => room.id === updatedRoom.id);
    if (roomIndex === -1) return;

    this.rooms = this.rooms.map((room, index) => index === roomIndex ? updatedRoom : room);

    // If the updated room is the currently selected room, update that too
    if (this.selectedRoom && this.selectedRoom.id === updatedRoom.id) {
      this.selectedRoom = updatedRoom;
    }
  }

  private initializeMercureSubscription(): void {
    const mercureHubUrl = 'http://mercure-hub-polo.freeboxos.fr:56666/.well-known/mercure?topic=' + `https://polocovoitapi.projets.garage404.com/api/users/${this.currentUser?.id}/rooms`;

    this.eventSource = new EventSource(mercureHubUrl);

    this.eventSource.onopen = (event) => {
      console.log('Connection to Mercure opened successfully!', event);
    };

    this.eventSource.onmessage = (event) => {
      console.log("HASTA LA VISTA REPONSE DE MERCURE SA MERE LA ");

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
              hasNewMessage: messageData.hasNewMessage,
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

  private loadRoomsForCurrentUser(): void {
    const user = this.sessionService.getSetLocalUserToClass();
    if (user) {
      this.tradeService.getAllRoomsOfAUser(user).subscribe(rooms => {
        rooms.forEach(room => {
          room.unreadCount = room.messages.reduce((count, message) => count + (message.hasNewMessage ? 1 : 0), 0);
        });
        this.store.dispatch(roomsLoaded({rooms}));
        this.selectedRoom = rooms[0] || null;
        this.initializeMercureSubscription();
      });
    }
  }

  private subscribeToRoomChanges(): void {
    this.store.select(state => state.state).subscribe(state => this.rooms = state.room || []);
  }
}
