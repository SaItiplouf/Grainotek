import {Injectable} from '@angular/core';
import {map, Observable} from "rxjs";
import {IPost} from "../models/post.model";
import {environnement} from "../../../environnement";
import {IPostImage} from "../models/postimage.model";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private http: HttpClient) {
  }

  getPostsFromApi(page: number): Observable<IPost[]> {
    return this.http.get<any[]>(environnement.BASE_URL + `api/posts?page=${page}`).pipe(
      map(data => this.mapToIPost(data))
    );
  }


  createPost(data: FormData): Observable<any> {
    return this.http.post(environnement.BASE_URL + "api/posts", data);
  }

  uploadImages(data: FormData): Observable<any> {
    return this.http.post(environnement.BASE_URL + "api/post_images", data);
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
