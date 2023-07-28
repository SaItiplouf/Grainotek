import {Component, OnInit} from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import {IPost} from "../../models/post.model";

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit{
  posts: IPost[] = [];

  constructor(private service: AppService) { }

  ngOnInit() {
    this.service.getPostFromApi().subscribe((data: any) => {
      if (data['hydra:member'] && Array.isArray(data['hydra:member'])) {
        this.posts = data['hydra:member'].map((post: any) => {
          const mappedPost: IPost = {
            id: post.id,
            name: post.name,
            content: post.content,
            location: post.location,
            userid: post.userid
          };
          return mappedPost;
        });
      }
    });
  }


}
