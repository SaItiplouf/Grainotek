import {Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {State} from "../../../Reducers/app.reducer";
import {Store} from "@ngrx/store";
import {AppService} from "../../../services/app.service";
import {IRoom} from "../../../models/room.model";
import {TradeService} from "../../../services/trade.service";
import {roomsLoaded} from "../../../actions/chat.actions";
import {SessionService} from "../../../services/session.service";
import {IUser, User} from "../../../models/user.model";

@Component({
  selector: 'app-chat-parent',
  templateUrl: './chat-parent.component.html',
  styleUrls: ['./chat-parent.component.scss']
})
export class ChatParentComponent implements OnInit, OnDestroy {
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
  }

  handleImageStatus(room: IRoom, status: 'error' | 'load'): void {
    console.log(`Image ${status} for room ${room.id}`);
    this.isLoading[room.id] = false;
  }

  ngOnInit(): void {
    this.currentUser = this.sessionService.getSetLocalUserToClass();
    this.loadRoomsForCurrentUser();
    this.subscribeToRoomChanges();
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

  updateRoomMessages(updatedRoom: IRoom, newMessages: any[]): void {
    const updatedRooms = this.rooms.map(room => {
      if (room.id === updatedRoom.id) {
        return {...room, messages: newMessages};
      } else {
        return room;
      }
    });

    this.store.dispatch(roomsLoaded({rooms: updatedRooms}));
  }


  private initializeMercureSubscription(): void {
    // Remplacez ceci par l'URL de votre hub Mercure
    const mercureHubUrl = 'http://88.120.198.111:56666/.well-known/mercure?topic=' + `https://polocovoitapi.projets.garage404.com/api/rooms/1`;

    this.eventSource = new EventSource(mercureHubUrl);

    this.eventSource.onopen = (event) => {
      console.log('Connection to Mercure opened successfully!', event);
    };
    this.eventSource.onmessage = (event) => {
      this.ngZone.run(() => {
        const data = JSON.parse(event.data);
        console.log('Parsed data:', data);
        const roomId = data.id;

        // Update the messages of the appropriate room
        this.updateRoomMessages(data, data.messages);

        if (this.selectedRoom && roomId === this.selectedRoom.id) {
          // Also update the selectedRoom if it's the same as the updated room
          this.selectedRoom = {
            ...this.selectedRoom,
            messages: data.messages
          };
        }
      });
    };

    this.eventSource.onerror = (error: any) => {
      console.error('Error occurred with Mercure:', error);
      if (error.target && error.target.readyState === EventSource.CLOSED) {
        console.error('Connection was closed!');
        // Essayez de vous reconnecter après un délai.
        setTimeout(() => this.initializeMercureSubscription(), 5000);  // Tentez une reconnexion après 5 secondes
      }
    };
    if (this.eventSource.readyState === EventSource.CONNECTING) {
      console.log('Attempting to connect to Mercure...');
    } else if (this.eventSource.readyState === EventSource.OPEN) {
      console.log('Connected to Mercure!');
    } else if (this.eventSource.readyState === EventSource.CLOSED) {
      console.log('Connection to Mercure was closed!');
    }
  }


  private loadRoomsForCurrentUser(): void {
    const user = this.sessionService.getSetLocalUserToClass();
    if (user) {
      this.tradeService.getAllRoomsOfAUser(user).subscribe(rooms => {
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
