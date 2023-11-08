import {Component, OnDestroy, AfterViewInit, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import * as CryptoJS from 'crypto-js';
import { AppService } from "../../../../services/app.service";
import { IPost } from "../../../../models/post.model";
import { forkJoin, Subscription } from "rxjs";
import { PostService } from "../../../../services/post.service";
import { IUser } from "../../../../models/user.model";
import { Store } from "@ngrx/store";
import { State } from "../../../../Reducers/app.reducer";
import { selectUser } from "../../../../selector/user.selectors";
import { RoomService } from "../../../../services/ChatRelated/room.service";
import { SessionService } from "../../../../services/session.service";
import { ChatParentComponent } from "../../ChatParent/chat-parent.component";
import { SharedService } from "../../../../../ComponentService/sharedata";

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

  constructor(private route: ActivatedRoute,
              private postService: PostService,
              private appService: AppService,
              private roomService: RoomService,
              private sessionService: SessionService,
              private router: Router,
              private sharedService: SharedService,
              private store: Store<{
                state: State
              }>) { }

  ngOnInit() {
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
          ({ userInfo, userPosts }) => {
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
    this.userSubscription = this.store.select((state) => state.state.user).subscribe((selectedUser) => {
      if (selectedUser !== null) {
        console.log(selectedUser);
        this.roomService.chatWithUser(selectedUser, targetUser).subscribe((response) => {
          console.log("Réponse reçue :", response);

          this.sharedService.shareData({ user: selectedUser, targetUser: targetUser });

          this.router.navigate(['pm']);
        });
      } else {
        console.log("L'utilisateur est null.");
        return;
      }
    });
  }

  ngOnDestroy() {
    // Désabonnez-vous de la souscription dans ngOnDestroy pour éviter les fuites mémoire.
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
