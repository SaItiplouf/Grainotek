import {AfterViewChecked, AfterViewInit, Component, ElementRef, Input, NgZone, OnInit, ViewChild} from '@angular/core';
import {IRoom} from "../../../../models/room.model";
import {IUser, User} from "../../../../models/user.model";
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
export class RoomScreenComponent implements OnInit, AfterViewChecked{
  selectedRoom!: IRoom;
  currentUser!: User;
  @ViewChild('messageList') private messageListRef!: ElementRef;

  constructor(private store: Store<{ state: State }>) {
  }

  ngOnInit() {
    this.store.select((state: any) => state.state.selectedRoom).subscribe((room: IRoom) => {
      this.selectedRoom = room
    });
    this.store.select((state: any) => state.state.user).subscribe((user: IUser) => {
      this.currentUser = user
    });
  }

  // scroll to bottom au init
  ngAfterViewChecked() {
    if (this.messageListRef) {
      const messageList: HTMLDivElement = this.messageListRef.nativeElement;
      messageList.scrollTop = messageList.scrollHeight;
    }
  }

}
