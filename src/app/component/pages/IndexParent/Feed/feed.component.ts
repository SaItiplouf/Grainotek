import {Component, OnInit} from '@angular/core';
import {AppService} from 'src/app/services/app.service';
import {IPost} from "../../../../models/post.model";
import {MatDialog} from "@angular/material/dialog";
import {CreatePostComponent} from "./createpost/createpost.component";
import {SessionService} from "../../../../services/session.service";
import {Store} from "@ngrx/store";
import {State} from "../../../../Reducers/app.reducer";
import {PostService} from "../../../../services/post.service";
import {postsLoaded} from "../../../../actions/post.actions";
import {Router} from "@angular/router";
import {IUser} from "../../../../models/user.model";

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  posts: IPost[] = [];
  selector: string = ".main-panel";
  currentPage: number = 1;
  ConnectedUser!: IUser;

  constructor(private store: Store<{
                state: State
              }>, private PostService: PostService,
              private router: Router,
              private service: AppService,
              public dialog: MatDialog,
              private sessionService: SessionService) {
  }

  onScroll() {
    this.PostService.getPostsFromApi(this.currentPage + 1).subscribe(newPosts => {
      this.store.dispatch(postsLoaded({posts: [...this.posts, ...newPosts]}));
      this.currentPage++; // Incrémentez la page actuelle
    });
  }


  ngOnInit(): void {
    this.PostService.getPostsFromApi(1).subscribe(posts => {
      this.store.dispatch(postsLoaded({posts}));
      console.log(posts)
    });
    this.store.select((state: any) => state.state.posts).subscribe((post: IPost[]) => {
      this.posts = post;
    });
    this.getConnectedUserInformationViaToken()
  }

  getConnectedUserInformationViaToken() {
    const ConnectedUser = this.sessionService.getUserInfo();
    if (ConnectedUser) {
      this.ConnectedUser = ConnectedUser;
    } else {
      return
    }
  }


  isUserLoggedIn(): boolean {
    return this.sessionService.isUserLoggedIn();
  }

  openDialog(): void {
    window.scrollTo(0, 0);
    this.dialog.open(CreatePostComponent, {
      autoFocus: false,
      width: "500px",
    });
  }

  openPostDialog(post: IPost): void {
    this.PostService.DisplayPostModal(post)
  }


  formatTime(post: IPost): any {
    return this.PostService.formatTimeSince(post.createdAt);
  }

}

