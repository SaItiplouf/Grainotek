import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SessionService} from "../session.service";

@Injectable()
export class JwtInterceptorInterceptor implements HttpInterceptor {

  constructor(private sessionService: SessionService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (!this.sessionService.isTokenValid()) {
      localStorage.removeItem('jwt');
    }

    return next.handle(request);
  }
}

// intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//   // Ajout d'un en-tête d'autorisation avec le jeton jwt si disponible
//   let jwtToken = localStorage.getItem('jwt');
//   if (jwtToken) {
//     let jwt = JSON.parse(jwtToken);
//     if (jwt) {
//       request = request.clone({
//         setHeaders: {
//           Authorization: `Bearer ${jwt}`
//         }
//       });
//     }
//   }
//   return next.handle(request);
// }


