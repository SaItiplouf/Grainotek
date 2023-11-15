import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import * as CryptoJS from 'crypto-js';
import {AppService} from "../../../../services/app.service";
import {IPost} from "../../../../models/post.model";
import {forkJoin, Subscription} from "rxjs";
import {PostService} from "../../../../services/post.service";
import {IUser} from "../../../../models/user.model";
import {Store} from "@ngrx/store";
import {State} from "../../../../Reducers/app.reducer";
import {RoomService} from "../../../../services/ChatRelated/room.service";
import {SessionService} from "../../../../services/session.service";
import {SharedService} from "../../../../../ComponentService/sharedata";
import {IRoom} from "../../../../models/room.model";
import {addRoom, selectRoom, updateRoom} from "../../../../actions/chat.actions";

@Component({
  selector: 'app-profile-parent',
  templateUrl: './profile-parent.component.html',
  styleUrls: ['./profile-parent.component.scss']
})
export class ProfileParentComponent implements OnInit, OnDestroy {
  encryptedUserId?: string;
  userInfo?: any;
  userPosts: IPost[] = [];
  private userSubscription: Subscription | null = null;
  rooms?: IRoom[];
  currentUser?: IUser
  constructor(private route: ActivatedRoute,
              private postService: PostService,
              private appService: AppService,
              private roomService: RoomService,
              private sessionService: SessionService,
              private router: Router,
              private sharedService: SharedService,
              private store: Store<{
                state: State
              }>) {
  }

  ngOnInit() {
    this.store.select((state: any) => state.state.room).subscribe((room: IRoom[]) => {
      this.rooms = room;
      console.log(this.rooms, room)
    });
    this.store.select((state: any) => state.state.user).subscribe((user: IUser) => {
      this.currentUser = user;
    });
    this.route.params.subscribe(params => {
      const encodedEncryptedId = this.route.snapshot.paramMap.get('userId');

      if (encodedEncryptedId) {
        const decryptedIdString = decodeURIComponent(encodedEncryptedId);
        const bytes = CryptoJS.AES.decrypt(decryptedIdString, 'clé secrète');
        const decryptedId = bytes.toString(CryptoJS.enc.Utf8);

        forkJoin({
          userInfo: this.appService.getInformationAboutAUser(decryptedId.toString()),
          userPosts: this.appService.getAllPostAboutAUser(decryptedId.toString())
        }).subscribe(
          ({userInfo, userPosts}) => {
            this.userInfo = userInfo;
            this.userPosts = userPosts;
          },
          error => {
            console.error('Erreur lors de la récupération des informations de l’utilisateur et de ses postes:', error);
          }
        );
      } else {
        console.error("UserId est manquant dans l'URL.");
      }
    });
  }

  isUserLoggedIn(): boolean {
    return this.sessionService.isUserLoggedIn();
  }

  openPostDialog(post: IPost): void {
    this.postService.DisplayPostModal(post);
  }

  openChat(targetUser: IUser) {
      if (this.currentUser !== null) {
        if (targetUser.id === this.currentUser?.id) {
          console.log("targetuser:", targetUser, this.currentUser)
          this.router.navigate(['pm']);
          return
        }
        if (this.rooms) {
          console.log("deja oui ya des rooms", this.rooms)
          // Vérifiez si une "room" correspondant aux critères existe déjà
          const existingRoom = this.rooms.find(room => {
            return (
              !room.trade &&
              room.users.some(user => user.id === this.currentUser!.id) &&
              room.users.some(user => user.id === targetUser.id)
            );
          });
          if (existingRoom) {
            console.log("La room existe déjà dans le front.");
            this.store.dispatch(selectRoom({ room: existingRoom }));
            this.router.navigate(['pm']);
          }else {
            console.log("CA VAAAA OUUUUUUUUUUUUUU")
            // Si la "room" n'existe pas, faites la requête au service
            this.roomService.chatWithUser(this.currentUser!, targetUser).subscribe((response) => {
              console.log("Réponse reçue :", response);
              this.store.dispatch(addRoom({ room: response }));
              console.log(this.rooms)
              this.store.dispatch(selectRoom({room: response}));
              this.router.navigate(['pm']);
            });
          }
      } else {
        console.log("L'utilisateur est null.");
        return;
      }
    };
  }

  ngOnDestroy() {
    // éviter les fuites mémoire
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
