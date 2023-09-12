import {Component, EventEmitter, Input, NgZone, Output} from '@angular/core';
import {IRoom} from "../../../../models/room.model";
import {Message} from "../../../../models/message.model";
import {IUser, User} from "../../../../models/user.model";
import {Store} from "@ngrx/store";
import {State} from "../../../../Reducers/app.reducer";
import {TradeService} from "../../../../services/trade.service";
import {AppService} from "../../../../services/app.service";
import {SessionService} from "../../../../services/session.service";

@Component({
  selector: 'app-room-sidebar',
  templateUrl: './room-sidebar.component.html',
  styleUrls: ['./room-sidebar.component.scss']
})
export class RoomSidebarComponent {
  @Input() selectedRoom: IRoom | null = null;
  @Input() currentUser!: User | null;
  @Input() rooms: IRoom[] = [];

  searchTerm: string = '';

  @Output() roomSelected: EventEmitter<IRoom> = new EventEmitter<IRoom>();
  constructor(
    private store: Store<{ state: State }>,
    private tradeService: TradeService) {
  }
  get filteredRooms(): IRoom[] {
    if (!this.searchTerm) {
      return this.rooms;
    }

    return this.rooms.filter(room =>
      room.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }


  selectRoom(room: IRoom): void {
    this.selectedRoom = room;
    this.roomSelected.emit(this.selectedRoom);

    if (room.messages.some(message => message.readed)) {
      this.tradeService.markMessagesAsReadForUser(this.selectedRoom, this.currentUser!).subscribe(
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
  private updateLocalRoomState(updatedRoom: IRoom): void {
    const roomIndex = this.rooms.findIndex(room => room.id === updatedRoom.id);
    if (roomIndex === -1) return;

    this.rooms = this.rooms.map((room, index) => index === roomIndex ? updatedRoom : room);

    // If the updated room is the currently selected room, update that too
    if (this.selectedRoom && this.selectedRoom.id === updatedRoom.id) {
      this.selectedRoom = updatedRoom;
    }
  }
  getRecipient(room: IRoom): IUser | null {
    return room.users.find(user => user.id !== this.currentUser?.id) || null;
  }
  get isLoading() {
    return this.tradeService.isLoading;
  }
  getLastMessage(room: IRoom): Message | null {
    return room.messages.length > 0 ? room.messages[room.messages.length - 1] : null;
  }
  handleImageError(room: IRoom): void {
    console.log(`Image error for room ${room.id}`);
    this.isLoading[room.id] = false;
  }

  handleImageLoad(room: IRoom): void {
    console.log(`Image loaded for room ${room.id}`);
    this.isLoading[room.id] = false;
  }
  handleImageStatus(room: IRoom, status: 'error' | 'load'): void {
    console.log(`Image ${status} for room ${room.id}`);
    this.isLoading[room.id] = false;
  }
}
