import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, take} from 'rxjs';
import {environnement} from "../../environnement";
import {Store} from "@ngrx/store";
import {State} from "../Reducers/app.reducer";
import {tap} from 'rxjs/operators';
import {setUser} from "../actions/post.actions";
import {IUser, User} from "../models/user.model";
import {IPost} from "../models/post.model";

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient, private store: Store<{ state: State }>) {
  }

  setUserToStorage(User: User) {
    // setitem to localstorage
  }

  getInformationAboutAUser(decryptedId: string): Observable<void> {
    return this.http.get<void>(environnement.BASE_URL + `api/users/${decryptedId}`, {});
  }

  getAllPostAboutAUser(decryptedId: string): Observable<IPost[]> {
    return this.http.get<IPost[]>(environnement.BASE_URL + `api/users/${decryptedId}/posts`);
  }

  updateUserInfo(userId: number, data: any): Observable<void> {
    return this.http.patch(environnement.BASE_URL + `api/users/${userId}`, data).pipe(
      tap(updatedUserData => {
        this.store.select((state: any) => state.state.user).pipe(
          take(1),
          map(currentUser => {
            const updatedUser: IUser = {...currentUser, ...data};
            return updatedUser;
          }),
          tap(updatedUser => {
            this.store.dispatch(setUser({user: updatedUser}));
          })
        ).subscribe();
      }),
      map(() => {
      }) // Retourne une valeur vide pour satisfaire le type Observable<void>
    );
  }

  updateProfilePicture(userId: number, file: File): Observable<IUser> {
    const formData = new FormData();
    formData.append('pictureFile', file);
    return this.http.post(environnement.BASE_URL + `api/users/${userId}/picture`, formData).pipe(
      map(updatedUser => {
        return updatedUser as IUser;
      }),
      tap(updatedUser => {
        this.store.dispatch(setUser({user: updatedUser}));
      })
    );
  }

}

