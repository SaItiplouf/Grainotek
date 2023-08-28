import {Component, Inject} from '@angular/core';
import {IPost} from "../../../../../models/post.model";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-showpost',
  templateUrl: './showpost.component.html',
  styleUrls: ['./showpost.component.scss']
})
export class ShowpostComponent {
  public post: IPost;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { post: IPost }) {
    this.post = data.post;
  }

}
