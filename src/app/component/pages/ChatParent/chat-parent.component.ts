import {AfterViewChecked, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {State} from "../../../Reducers/app.reducer";
import {Store} from "@ngrx/store";
import {AppService} from "../../../services/app.service";
import {IRoom, Room} from "../../../models/room.model";
import {roomsLoaded, updateRoom} from "../../../actions/chat.actions";
import {SessionService} from "../../../services/session.service";
import {IUser, User} from "../../../models/user.model";
import {MessageService} from "../../../services/ChatRelated/message.service";
import {RoomService} from "../../../services/ChatRelated/room.service";
import {TradeService} from "../../../services/ChatRelated/trade.service";
import {ActivatedRoute} from "@angular/router";
import {environnement} from "../../../../environnement";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-chat-parent',
  templateUrl: './chat-parent.component.html',
  styleUrls: ['./chat-parent.component.scss']
})
export class ChatParentComponent implements OnInit, OnDestroy, AfterViewChecked {
  selectedRoom!: IRoom;
  @Input() currentUser!: User | null;
  rooms: IRoom[] = [];
  selector: string = ".main-panel";
  currentPage: number = 1;
  isSidebarHidden = true;
  hasRooms: boolean = false;
  @ViewChild('messageList') private messageListRef!: ElementRef;
  private userSubscription?: Subscription;
  private roomSubscription?: Subscription;

  constructor(
    private store: Store<{ state: State }>,
    private tradeService: TradeService,
    private ngZone: NgZone,
    private appService: AppService,
    private sessionService: SessionService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private roomService: RoomService) {
  }

  ngOnInit(): void {
    this.sessionService.checkUserAuthentication();

    this.userSubscription = this.store.select((state: any) => state.state.user).subscribe((user: IUser) => {
      this.currentUser = user;
    });
    this.roomSubscription = this.store.select(state => state.state.room).subscribe(rooms => {
      this.rooms = rooms || [];
      this.hasRooms = this.rooms && this.rooms.length > 0;
    });
    this.store.select((state: any) => state.state.selectedRoom).subscribe((room: IRoom) => {
      this.selectedRoom = room
    });
  }

  // scroll to bottom au init
  ngAfterViewChecked() {
    if (this.messageListRef) {
      const messageList: HTMLDivElement = this.messageListRef.nativeElement;
      messageList.scrollTop = messageList.scrollHeight;
    }
  }

  // détruit la souscription à mercure pour l'opti
  ngOnDestroy(): void {

    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

    if (this.roomSubscription) {
      this.roomSubscription.unsubscribe();
    }
    this.sessionService.userLoggedOut.unsubscribe();
  }

  // Reception de l'output du composant enfant
  onRoomSelected(room: IRoom): void {
    this.selectedRoom = room;
  }

  // onScroll() {
  //   this.TradeService.getAllRoomsOfAUser(this.currentPage + 1).subscribe(newRooms => {
  //     this.store.dispatch(roomsLoaded({room: [...this.rooms, ...newRooms]}));
  //     this.currentPage++; // Incrémentez la page actuelle
  //   });


// cette fonction attend la réponse de mercure pour mettre à jour la room, le message est envoyé à l'api,
// l'api va notifier mercure, lui vas notifier le client et cette fonction permet la mise à jour du state de celui ci pour la persistance
  updateRoomMessages(updatedRoom: Room): void {
    if (!updatedRoom || !updatedRoom.id) return;

    const roomIndex = this.rooms.findIndex(room => room.id === updatedRoom.id);
    if (roomIndex === -1) return;

    const roomToUpdate = { ...this.rooms[roomIndex] };
    // Fusion des messages existants avec les nouveaux
    const currentRoomMessages = roomToUpdate.messages || [];
    const newMessages = updatedRoom.messages.filter(
      updatedMsg => !currentRoomMessages.some(currMsg => currMsg.id === updatedMsg.id)
    );
    roomToUpdate.messages = [...currentRoomMessages, ...newMessages];


    // Adjuster uniquement unreadCount si ce n'est pas la selectedRoom
    if (!(this.selectedRoom && this.selectedRoom.id === updatedRoom.id)) {
      roomToUpdate.unreadCount! += newMessages.reduce((count, message) => {
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
    this.store.dispatch(updateRoom({ room: roomToUpdate }));

    // Mise à jour de la salle sélectionnée si nécessaire
    if (this.selectedRoom && this.selectedRoom.id === updatedRoom.id) {
      this.selectedRoom = {
        ...this.selectedRoom,
        messages: this.rooms[roomIndex].messages,
        unreadCount: roomToUpdate.unreadCount
      };
    }
  }

  toggleSidebar() {
    this.isSidebarHidden = !this.isSidebarHidden;
  }


  // private loadRoomsForCurrentUser(): void {
  //   if (this.currentUser) {
  //
  //       // Suppression de la notification de nouveaux messages + traitement en back au chargement de la première room
  //       if (this.selectedRoom && this.currentUser) {
  //         this.messageService.markMessagesAsReadForUser(this.selectedRoom, this.currentUser).subscribe(
  //           response => {
  //             console.log('Marked messages as read:', response);
  //             setTimeout(() => {
  //               // Clone the selectedRoom object and update unreadCount
  //               this.selectedRoom! = {...this.selectedRoom!, unreadCount: 0};
  //
  //               // Clone the room you want to update in the rooms array and update unreadCount
  //               const roomIndex = this.rooms.findIndex(room => room.id === this.selectedRoom!.id);
  //               if (roomIndex !== -1) {
  //                 const updatedRoom = {...this.rooms[roomIndex], unreadCount: 0};
  //                 const updatedRooms = [...this.rooms]; // Create a new array
  //                 updatedRooms[roomIndex] = updatedRoom; // Update the element in the new array
  //                 this.rooms = updatedRooms; // Assign the new array back to this.rooms
  //               }
  //             }, 3000);
  //
  //           },
  //           error => {
  //             console.error('Error marking messages as read:', error);
  //           }
  //         );
  //
  //
  //     };
  //   }
  // }


}
