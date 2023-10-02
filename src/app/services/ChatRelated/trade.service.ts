import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environnement} from "../../../environnement";
import {IUser} from "../../models/user.model";
import {IRoom} from "../../models/room.model";
import {ITrade} from "../../models/trade.model";

@Injectable({
  providedIn: 'root'
})
export class TradeService {

  constructor(private http: HttpClient) {
  }

  createTrade(data: any): Observable<any> {
    return this.http.post(environnement.BASE_URL + "api/trades", data);
  }

  getAllTradeFromAUser(user: IUser): Observable<any> {
    return this.http.get(environnement.BASE_URL + `api/users/${user.id}/trade`);
  }


  updateTrade(trade: ITrade, statut: string, room?: IRoom): Observable<any> {
    if (!statut && !room) {
      throw new Error("Aucun statut ni room n'a été fourni.");
    }

    let patchData: any = {};
    if (statut) {
      patchData.statut = statut;
    }
    if (room) {
      patchData.room = room;
    }
    console.log(patchData);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/merge-patch+json'
      })
    };
    return this.http.patch(environnement.BASE_URL + `api/trade/${trade.id}`, patchData, httpOptions);
  }

  updatePatchDeleted(trade: ITrade, user: IUser): Observable<any> {
    const patchData: { [key: string]: any } = {};

    if (user.id === trade.applicant.id) {
      patchData['applicantDeleted'] = true;
    } else if (user.id === trade.userPostOwner.id) {
      patchData['postOwnerDeleted'] = true;
    } else {
      throw new Error("L'utilisateur n'est ni créateur du trade ni le receveur");
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/merge-patch+json'
      })
    };

    return this.http.patch(environnement.BASE_URL + `api/trade/${trade.id}`, patchData, httpOptions);
  }

}
