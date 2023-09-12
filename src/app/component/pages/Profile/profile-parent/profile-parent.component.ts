import {Component} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import * as CryptoJS from 'crypto-js';
import {AppService} from "../../../../services/app.service";
import {IPost} from "../../../../models/post.model";
import {forkJoin} from "rxjs";
import {PostService} from "../../../../services/post.service";

@Component({
  selector: 'app-profile-parent',
  templateUrl: './profile-parent.component.html',
  styleUrls: ['./profile-parent.component.scss']
})
export class ProfileParentComponent {
  encryptedUserId?: string;
  userInfo?: any;
  userPosts: IPost[] = [];


  constructor(private route: ActivatedRoute, private PostService: PostService, private AppService: AppService) {
    this.route.params.subscribe(params => {
      const encodedEncryptedId = this.route.snapshot.paramMap.get('userId');

      if (encodedEncryptedId) {
        const decryptedIdString = decodeURIComponent(encodedEncryptedId);
        const bytes = CryptoJS.AES.decrypt(decryptedIdString, 'clé secrète');
        const decryptedId = bytes.toString(CryptoJS.enc.Utf8);

        forkJoin({
          userInfo: this.AppService.getInformationAboutAUser(decryptedId.toString()),
          userPosts: this.AppService.getAllPostAboutAUser(decryptedId.toString())
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

  openPostDialog(post: IPost): void {
    this.PostService.DisplayPostModal(post)
  }
}


