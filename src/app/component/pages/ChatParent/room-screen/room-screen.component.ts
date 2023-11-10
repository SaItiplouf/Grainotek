import {Component, Input} from '@angular/core';
import {IRoom} from "../../../../models/room.model";
import {User} from "../../../../models/user.model";

@Component({
  selector: 'app-room-screen',
  templateUrl: './room-screen.component.html',
  styleUrls: ['./room-screen.component.scss']
})
export class RoomScreenComponent {
  @Input() selectedRoom: IRoom | null = null;
  @Input() currentUser!: User | null;

  // on utilise selectedRoom ici attention à la mise à jour des variables car le store est mise à jour mais ceci est une variable
}
