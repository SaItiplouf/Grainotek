import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient) { }

  getPostFromApi(): Observable<any> {
    return this.http.get('https://polocovoitapi.projets.garage404.com/api/posts');
  }
  getImagesFromApi(postId: number): Observable<any> {
    return this.http.get(`your-api-url/posts/${postId}/images`);
  }
}

