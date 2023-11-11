import {Component, OnDestroy, OnInit} from '@angular/core';
import {IRoom} from "../../../../models/room.model";
import {Message} from "../../../../models/message.model";
import {IUser} from "../../../../models/user.model";
import {Store} from "@ngrx/store";
import {State} from "../../../../Reducers/app.reducer";
import {TradeService} from "../../../../services/ChatRelated/trade.service";
import {RoomService} from "../../../../services/ChatRelated/room.service";
import {MessageService} from "../../../../services/ChatRelated/message.service";
import {MatDialog} from "@angular/material/dialog";
import {DeletetradedialogComponent} from "../deletetradedialog/deletetradedialog.component";
import {ITrade} from "../../../../models/trade.model";
import {SharedService} from "../../../../../ComponentService/sharedata";
import {Subscription} from "rxjs";
import {selectRoom} from "../../../../actions/chat.actions";

@Component({
  selector: 'app-room-sidebar',
  templateUrl: './room-sidebar.component.html',
  styleUrls: ['./room-sidebar.component.scss']
})
export class RoomSidebarComponent implements OnInit, OnDestroy {
  selectedRoom!: IRoom;
  currentUser!: IUser;
  rooms: IRoom[] = [];
  searchTerm: string = '';
  private dataToShareSubscription: Subscription | null = null;
  private roomSubscription: Subscription | null = null;

  constructor(
    private store: Store<{ state: State }>,
    private tradeService: TradeService,
    private roomService: RoomService,
    private dialog: MatDialog,
    private sharedService: SharedService,
    private messageService: MessageService) {
  }

  get filteredRooms(): IRoom[] {
    if (!this.searchTerm) {
      return this.rooms
      // return this.rooms.slice().sort((a, b) => {
      //   const lastMessageA = a.messages[a.messages.length - 1];
      //   const lastMessageB = b.messages[b.messages.length - 1];
      //
      //   if (!lastMessageA && !lastMessageB) {
      //     return 0;
      //   } else if (!lastMessageA) {
      //     return 1;
      //   } else if (!lastMessageB) {
      //     return -1;
      //   }
      //
      //   return new Date(lastMessageB.createdAt).getTime() - new Date(lastMessageA.createdAt).getTime();
      // });
    }

    return this.rooms.filter(room =>
      room.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get isLoading() {
    return this.roomService.isLoading;
  }

  ngOnInit() {
    this.dataToShareSubscription = this.sharedService.dataToShare$.subscribe((data: {
      user: IUser,
      targetUser: IUser
    }) => {
      if (data && data.user && data.targetUser) {
        this.updateSelectedRoomProfileRedirection(data.user, data.targetUser);
      } else {
        console.log("Aucune donnée disponible.");
      }
    });

    this.store.select((state: any) => state.state.selectedRoom).subscribe((room: IRoom) => {
      this.selectedRoom = room
      console.log("update room")
    });
    this.store.select((state: any) => state.state.user).subscribe((user: IUser) => {
      this.currentUser = user
    });
    this.roomSubscription = this.store.select((state) => state.state.room).subscribe((rooms: IRoom[]) => {
      this.rooms = rooms;
      console.log("update rooms")
    });
  }

  ngOnDestroy() {
    if (this.dataToShareSubscription) {
      this.dataToShareSubscription.unsubscribe();
    }
    if (this.roomSubscription) {
      this.roomSubscription.unsubscribe();
    }
  }

  selectRoom(room: IRoom): void {
   this.store.dispatch(selectRoom({room}))

    if (room.messages.some(message => message.readed)) {
      this.messageService.markMessagesAsReadForUser(this.selectedRoom, this.currentUser!).subscribe(
        response => {
          // Log the response
          console.log('API response:', response);

          // Mark all messages in the selected room as read in the local state
          const updatedRoom = {...room};
          updatedRoom.messages = room.messages.map(message => {
            return {...message, readed: false};
          });
          updatedRoom.unreadCount = 0;
          this.updateLocalRoomState(updatedRoom);
        },
        error => console.error('Error updating messages:', error)
      );
    }
  }

  private updateSelectedRoomProfileRedirection(user: IUser, targetUser: IUser) {
    console.log("AHDZJHADHAZ NINHO GHRRR", this.rooms, user, targetUser);
    const room = this.rooms.find((room) => {
      const hasUser = room.users.some(u => u.id === user.id);
      const hasTargetUser = room.users.some(u => u.id === targetUser.id);
      const hasNoITrade = !room.trade;

      if (hasUser && hasTargetUser && hasNoITrade) {
        console.log('La salle a été trouvée pour l\'utilisateur, l\'utilisateur cible et n\'a pas d\'objet ITRADE :', room);
      }
      return hasUser && hasTargetUser && hasNoITrade;
    });
    if (room) {
      this.selectRoom(room);
      console.log("SELECTED ROOM = ", this.selectedRoom);
    }
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
  handleImageError(room: IRoom): void {
    console.log(`Image error for room ${room.id}`);
    this.isLoading[room.id] = false;
  }

  handleImageLoad(room: IRoom): void {
    this.isLoading[room.id] = false;
  }

  handleImageStatus(room: IRoom, status: 'error' | 'load'): void {
    console.log(`Image ${status} for room ${room.id}`);
    this.isLoading[room.id] = false;
  }
  closeTrade(room: IRoom, trade: ITrade) {
    this.dialog.open(DeletetradedialogComponent, {
      width: "70vh",
      autoFocus: false,
      data: {room, trade}
    });
  }

  getRecipient(room: IRoom): IUser | null {
    return room.users.find(user => user.id !== this.currentUser?.id) || null;
  }

  getLastMessage(room: IRoom): Message | null {
    return room.messages.length > 0 ? room.messages[room.messages.length - 1] : null;
  }
}
