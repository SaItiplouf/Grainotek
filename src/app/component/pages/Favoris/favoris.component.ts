import {Component, OnInit} from '@angular/core';
import {Store} from "@ngrx/store";
import {State} from "../../../Reducers/app.reducer";
import {CommentsService} from "../../../services/comments.service";
import {loadFavorites} from "../../../actions/post.actions";
import {SessionService} from "../../../services/session.service";
import {IUser} from "../../../models/user.model";
import {IPostCommentLike} from "../../../models/postcommentLike.model";
import {PostService} from "../../../services/post.service";
import {IPost} from "../../../models/post.model";

@Component({
  selector: 'app-favoris',
  templateUrl: './favoris.component.html',
  styleUrls: ['./favoris.component.scss']
})
export class FavorisComponent implements OnInit {

  userInfo!: IUser
  favorites!: IPostCommentLike[];

  constructor(private store: Store<{ state: State }>,
              private commentService: CommentsService,
              private sessionService: SessionService,
              private postService: PostService) {
  }

  ngOnInit() {
    this.sessionService.checkUserAuthentication();
    this.store.select((state: any) => state.state.user).subscribe((user: IUser) => {
      this.userInfo = user;
      if (this.userInfo !== null) {

        this.commentService.getFavorites(this.userInfo).subscribe(
          (data) => {
            this.store.dispatch(loadFavorites({favorites: data}));
          },
          (error) => {
            console.error('Une erreur s\'est produite :', error);
          }
        );
      } else {
        console.error('Aucune réponse de getUserInfo');
      }
      this.store.select((state: any) => state.state.favorites).subscribe((favorites: IPostCommentLike[]) => {
        this.favorites = favorites;
      });
    });


  }

  showPost(post: IPost) {
    this.postService.DisplayPostModal(post)
  }
}
