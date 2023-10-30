import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environnement} from "../../environnement";
import {IPostComment, IPostPostComment} from "../models/postcomment.model";
import {IPost} from "../models/post.model";
import {IUser} from "../models/user.model";
import {IPostCommentLike} from "../models/postcommentLike.model";

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  constructor(private http: HttpClient) {
  }

  getCommentsOfAPostFromApi(post: IPost, page: number): Observable<IPostComment[]> {
    return this.http.get<any[]>(environnement.BASE_URL + `api/post_comments/post/${post.id}?page=${page}`);
  }

  createComment(data: IPostPostComment): Observable<IPostComment> {
    return this.http.post<any>(environnement.BASE_URL + `api/post_comments`, data);
  }

  likeComment(data: any) {
    return this.http.post<any>(environnement.BASE_URL + `api/post_comment_likes`, data);
  }

  getFavorites(user: IUser): Observable<IPostCommentLike[]> {
    return this.http.get<any[]>(environnement.BASE_URL + `api/post_comment_likes/user/${user.id}`);
  }
}
