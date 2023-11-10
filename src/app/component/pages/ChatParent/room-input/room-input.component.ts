import {Component, Input} from '@angular/core';
import {IRoom} from "../../../../models/room.model";
import {User} from "../../../../models/user.model";
import {MessageService} from "../../../../services/ChatRelated/message.service";

@Component({
  selector: 'app-room-input',
  templateUrl: './room-input.component.html',
  styleUrls: ['./room-input.component.scss']
})
export class RoomInputComponent {
  newMessageContent: string = '';
  @Input() selectedRoom: IRoom | null = null;
  @Input() currentUser!: User | null;
  isSending = false;

  constructor(private messageService: MessageService) {
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
      console.log('Erreur', this.selectedRoom, this.currentUser, this.newMessageContent)
    }
  }
}
