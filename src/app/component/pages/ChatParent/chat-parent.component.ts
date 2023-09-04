import {Component, OnInit} from '@angular/core';
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
export class ChatParentComponent implements OnInit {
  rooms: IRoom[] = [];
  selector: string = ".main-panel";
  currentPage: number = 1;
  currentUser!: User | null;
  selectedRoom: IRoom | null = null;
  newMessageContent: string = '';

  constructor(
    private store: Store<{ state: State }>,
    private tradeService: TradeService,
    private appService: AppService,
    private sessionService: SessionService) {
  }

  get isLoading() {
    return this.tradeService.isLoading;
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

  getRecipient(room: IRoom): IUser | null {
    return room.users.find(user => user.id !== this.currentUser?.id) || null;
  }

  private loadRoomsForCurrentUser(): void {
    const user = this.sessionService.getSetLocalUserToClass();
    if (user) {
      this.tradeService.getAllRoomsOfAUser(user).subscribe(rooms => {
        this.store.dispatch(roomsLoaded({rooms}));
        this.selectedRoom = rooms[0] || null;
      });
    }
  }

  private subscribeToRoomChanges(): void {
    this.store.select(state => state.state).subscribe(state => this.rooms = state.room || []);
  }
}
