import {Injectable} from '@angular/core';
import {map, Observable} from "rxjs";
import {IPost} from "../models/post.model";
import {environnement} from "../../../environnement";
import {IPostImage} from "../models/postimage.model";
import {HttpClient} from "@angular/common/http";
import {ShowpostComponent} from "../component/pages/IndexParent/Feed/showpost/showpost.component";
import {MatDialog} from "@angular/material/dialog";

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private http: HttpClient, public dialog: MatDialog) {
  }

  getPostsFromApi(page: number): Observable<IPost[]> {
    return this.http.get<any[]>(environnement.BASE_URL + `api/posts?page=${page}&order%5BcreatedAt%5D=desc`).pipe(
      map(data => this.mapToIPost(data))
    );
  }


  createPost(data: FormData): Observable<any> {
    return this.http.post(environnement.BASE_URL + "api/posts", data);
  }

  uploadImages(data: FormData): Observable<any> {
    return this.http.post(environnement.BASE_URL + "api/post_images", data);
  }

  DisplayPostModal(post: IPost) {
    const formattedTime = this.formatTimeSince(post.createdAt);
    this.dialog.open(ShowpostComponent, {
      data: {post, formattedTime},
      width: "80%",
    });
  }

  formatTimeSince(time: string): string {
    const now = new Date();
    const createdAt = new Date(time);
    const diffInSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} secondes passées`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes passées`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} heures passées`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)} jours passés`;
    }
  }

  private mapToIPost(data: any[]): IPost[] {
    return data.map(post => {
      const imagesArray = post.images;
      const mappedImages: IPostImage[] = imagesArray.map((img: any) => {
        return {
          id: img.id.toString(),
          contentUrl: img.contentUrl
        };
      });

      return {
        id: post.id,
        name: post.name,
        content: post.content,
        location: post.location,
        user: post.user,
        images: mappedImages,
        createdAt: post.createdAt,
      };
    });
  }
}
