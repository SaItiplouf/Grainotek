import {Component, OnInit} from '@angular/core';
import {AppService} from 'src/app/services/app.service';
import {IPost} from "../../../../models/post.model";
import {MatDialog} from "@angular/material/dialog";
import {CreatePostComponent} from "./createpost/createpost.component";
import {SessionService} from "../../../../services/session.service";
import {Store} from "@ngrx/store";
import {State} from "../../../../Reducers/app.reducer";
import {ShowpostComponent} from "./showpost/showpost.component";
import {PostService} from "../../../../services/post.service";
import {postsLoaded} from "../../../../actions/post.actions";

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  posts: IPost[] = [];
  selector: string = ".main-panel";
  currentPage: number = 1;

  constructor(private store: Store<{
    state: State
  }>, private PostService: PostService, private service: AppService, public dialog: MatDialog, private sessionService: SessionService) {
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
    });
    this.store.select((state: any) => state.state).subscribe((state: State) => {
      this.posts = state.posts;
    });
  }

  isUserLoggedIn(): boolean {
    return this.sessionService.isUserLoggedIn();
  }

  openDialog(): void {
    this.dialog.open(CreatePostComponent, {
      width: "500px",
    });
  }

  openPostDialog(post: IPost): void {
    this.dialog.open(ShowpostComponent, {
      data: {post},
      width: "80%",
      height: "50%"
    });
  }
}

