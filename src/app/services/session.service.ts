import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable, Subject} from "rxjs";
import jwt_decode from 'jwt-decode';
import {IUser, User} from "../models/user.model";
import {environnement} from "../../../environnement";
import {Store} from "@ngrx/store";
import {setUser} from "../actions/post.actions";
import {State} from "../Reducers/app.reducer";

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  REGISTER_URL = 'register';
  LOGIN_URL = 'auth';
  BASE_URL: string = environnement.BASE_URL;
  userLoggedOut = new Subject<void>();
  userLoggedIn = new Subject<void>();

  constructor(private HttpClient: HttpClient, private store: Store<{
    state: State
  }>) {
  }

  async getUserInfoFromAPI(user: IUser) {
    const token = localStorage.getItem('jwt');

    if (token) {
      try {
        const response = await fetch(`${environnement.BASE_URL}api/users/${user.id}`, {
          method: 'GET',
          // headers: {
          //   'Authorization': `Bearer ${token}`
          // }
        });

        if (response.ok) {
          const userData = await response.json();

          const userInfoFromAPI = {
            id: userData.id,
            email: userData.email,
            roles: userData.roles,
            username: userData.username,
            pictureUrl: userData.pictureUrl,
          };

          return userInfoFromAPI;
        } else {
          console.error("Erreur lors de la requête API :", response.status);
          return null;
        }
      } catch (error) {
        console.error("Erreur lors de la requête API :", error);
        return null;
      }
    } else {
      return null;
    }
  }

  isTokenValid(): boolean {
    const decodedToken: any = this.decodeToken();
    if (decodedToken) {
      const currentTime = Math.floor(Date.now() / 1000);
      return decodedToken.exp >= currentTime;
    }
    return false;
  }

  getUserInfo(): IUser | null {
    const decodedToken: any = this.decodeToken();
    if (decodedToken) {
      const user: IUser = new User({
        id: decodedToken.id,
        email: decodedToken.email,
        roles: decodedToken.roles,
        username: decodedToken.username,
        pictureUrl: decodedToken.pictureUrl,
      });

      return user;
    }
    return null;
  }

  register(email: string, password: string): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    // formData.append('username', username);
    // formData.append('pictureFile', pictureFile, pictureFile.name);

    return this.HttpClient.post<any>(`${this.BASE_URL}api/${this.REGISTER_URL}`, formData);
  }

  login(email: string, password: string): Observable<any> {
    return this.HttpClient.post<any>(`${this.BASE_URL}${this.LOGIN_URL}`, {email, password})
      .pipe(
        map(response => {
          if (response) {
            localStorage.setItem('jwt', JSON.stringify(response));
            console.log('JWT STORED');
            this.userLoggedIn.next();
            this.setUserFromToken()
            return response;
          } else {
            console.log('JWT FAILED');
            throw new Error('JWT Failed'); // Lève une erreur si JWT a échoué
          }
        })
      );
  }

  setUserFromToken() {
    const userInfo = this.getUserInfo();
    if (userInfo) {
      this.store.dispatch(setUser({user: userInfo}));
    }
  }

  isUserLoggedIn(): boolean {
    return !!localStorage.getItem('jwt');
  }

  forgetToken() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('localUser');

    this.userLoggedOut.next();
  }

  private decodeToken(): any {
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        return jwt_decode(token);
      } catch (error) {
        console.error("Erreur lors du décodage du token:", error);
      }
    }
    return null;
  }

}
