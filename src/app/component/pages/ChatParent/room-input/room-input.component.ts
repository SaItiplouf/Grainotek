import {Component, Input} from '@angular/core';
import {IRoom} from "../../../../models/room.model";
import {IUser, User} from "../../../../models/user.model";
import {MessageService} from "../../../../services/ChatRelated/message.service";
import {Store} from "@ngrx/store";
import {State} from "../../../../Reducers/app.reducer";

@Component({
  selector: 'app-room-input',
  templateUrl: './room-input.component.html',
  styleUrls: ['./room-input.component.scss']
})
export class RoomInputComponent {
  newMessageContent: string = '';
  selectedRoom: IRoom | null = null;
  currentUser!: User | null;
  isSending = false;

  constructor(private store: Store<{ state: State }>,
              private messageService: MessageService) {
  }

  ngOnInit() {
    this.store.select((state: any) => state.state.selectedRoom).subscribe((room: IRoom) => {
      this.selectedRoom = room
    });
    this.store.select((state: any) => state.state.user).subscribe((user: IUser) => {
      this.currentUser = user
    });
  }
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
    } else {
      console.log('Erreur', this.newMessageContent, this.selectedRoom)
    }
  }
}
