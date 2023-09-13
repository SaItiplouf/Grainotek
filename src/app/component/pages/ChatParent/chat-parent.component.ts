import {AfterViewChecked, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {State} from "../../../Reducers/app.reducer";
import {Store} from "@ngrx/store";
import {AppService} from "../../../services/app.service";
import {IRoom, Room} from "../../../models/room.model";
import {roomsLoaded} from "../../../actions/chat.actions";
import {SessionService} from "../../../services/session.service";
import {User} from "../../../models/user.model";
import {MessageService} from "../../../services/ChatRelated/message.service";
import {RoomService} from "../../../services/ChatRelated/room.service";
import {TradeService} from "../../../services/ChatRelated/trade.service";

@Component({
  selector: 'app-chat-parent',
  templateUrl: './chat-parent.component.html',
  styleUrls: ['./chat-parent.component.scss']
})
export class ChatParentComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() selectedRoom: IRoom | null = null;
  @Input() currentUser!: User | null;
  @Input() rooms: IRoom[] = [];
  selector: string = ".main-panel";
  currentPage: number = 1;
  newMessageContent: string = '';
  isSending = false;
  isSidebarHidden = true;
  private eventSource: EventSource | null = null;
  @ViewChild('messageList') private messageListRef!: ElementRef;

  constructor(
    private store: Store<{ state: State }>,
    private tradeService: TradeService,
    private ngZone: NgZone,
    private appService: AppService,
    private sessionService: SessionService,
    private messageService: MessageService,
    private roomService: RoomService) {
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

  // scroll to bottom au init
  ngAfterViewChecked() {
    const messageList: HTMLDivElement = this.messageListRef.nativeElement;
    messageList.scrollTop = messageList.scrollHeight;
  }

  // détruit la souscription à mercure pour l'opti
  ngOnDestroy(): void {
    // Fermez la connexion Mercure
    if (this.eventSource) {
      this.eventSource.close();
    }
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

  // Uniquement Requete API et désactivation du boutton pour le spam
  sendMessage(): void {
    if (this.newMessageContent.trim() && this.selectedRoom && this.currentUser) {
      const {id: roomId} = this.selectedRoom;
      const {id: userId} = this.currentUser;

      // Désactiver le bouton avant d'envoyer la demande à l'API
      this.isSending = true;

      this.messageService.createMessage(this.newMessageContent, `/api/rooms/${roomId}`, `/api/users/${userId}`)
        .subscribe(
          () => {
            // Réponse reçue avec succès
            this.newMessageContent = '';
            this.isSending = false;
          },
          error => {
            console.error('Erreur lors de l\'envoi du message :', error);
            this.isSending = false;
          }
        );
    }
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

// Only adjust the unreadCount if it's not the selectedRoom
    if (!(this.selectedRoom && this.selectedRoom.id === updatedRoom.id)) {
      roomToUpdate.unreadCount! += newMessages.reduce((count, message) => {
        // Check if the message hasn't been read
        const isUnread = message.readed;

        // Check if the message isn't from the current user
        const notFromCurrentUser = message.user.id !== this.currentUser?.id;

        if (isUnread && notFromCurrentUser) {
          return count + 1;
        }
        return count;
      }, 0);
    }

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

  toggleSidebar() {
    this.isSidebarHidden = !this.isSidebarHidden;
  }

  private subscribeToRoomChanges(): void {
    this.store.select(state => state.state).subscribe(state => this.rooms = state.room || []);
  }

  private loadRoomsForCurrentUser(): void {
    const user = this.sessionService.getSetLocalUserToClass();
    if (user) {
      this.roomService.getAllRoomsOfAUser(user).subscribe(rooms => {
        rooms.forEach(room => {
          room.unreadCount = room.messages.reduce((count, message) => {
            const isUnread = message.readed;
            const notFromCurrentUser = message.user.id !== this.currentUser?.id;

            if (isUnread && notFromCurrentUser) {
              return count + 1;
            }
            return count;
          }, 0);
        });
        this.store.dispatch(roomsLoaded({rooms}));
        this.selectedRoom = rooms[0] || null;

        // Suppression de la notification de nouveaux messages + traitement en back au chargement de la première room
        if (this.selectedRoom && this.currentUser) {
          this.messageService.markMessagesAsReadForUser(this.selectedRoom, this.currentUser).subscribe(
            response => {
              console.log('Marked messages as read:', response);
              setTimeout(() => {
                // Clone the selectedRoom object and update unreadCount
                this.selectedRoom! = {...this.selectedRoom!, unreadCount: 0};

                // Clone the room you want to update in the rooms array and update unreadCount
                const roomIndex = this.rooms.findIndex(room => room.id === this.selectedRoom!.id);
                if (roomIndex !== -1) {
                  const updatedRoom = {...this.rooms[roomIndex], unreadCount: 0};
                  const updatedRooms = [...this.rooms]; // Create a new array
                  updatedRooms[roomIndex] = updatedRoom; // Update the element in the new array
                  this.rooms = updatedRooms; // Assign the new array back to this.rooms
                }
              }, 3000);

            },
            error => {
              console.error('Error marking messages as read:', error);
            }
          );
        }

        this.initializeMercureSubscription();
      });
    }
  }

  private initializeMercureSubscription(): void {
    const mercureHubUrl = 'http://mercure-hub-polo.freeboxos.fr:56666/.well-known/mercure?topic=' + `https://polocovoitapi.projets.garage404.com/api/users/${this.currentUser?.id}/rooms`;

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
}
