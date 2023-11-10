import {Component, Input, NgZone, OnInit} from '@angular/core';
import {IRoom} from "../../../../models/room.model";
import {User} from "../../../../models/user.model";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import {RoomService} from "../../../../services/ChatRelated/room.service";
import {Store} from "@ngrx/store";
import {State} from "../../../../Reducers/app.reducer";

@Component({
  selector: 'app-room-screen',
  templateUrl: './room-screen.component.html',
  styleUrls: ['./room-screen.component.scss']
})
export class RoomScreenComponent implements OnInit{
  selectedRoom!: IRoom;
  @Input() currentUser!: User | null;

  constructor(private store: Store<{ state: State }>) {}

  ngOnInit() {
    this.store.select((state: any) => state.state.selectedRoom).subscribe((room: IRoom) => {
      this.selectedRoom = room
    });
  }

  // on utilise selectedRoom ici attention à la mise à jour des variables car le store est mise à jour mais ceci est une variable
}
