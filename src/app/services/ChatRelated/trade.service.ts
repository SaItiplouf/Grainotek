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

    // Create a copy of the trade object
    let modifiedTrade = {...trade};

    if (statut) {
      modifiedTrade.statut = statut;
    }
    if (room) {
      modifiedTrade.room = room;
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/merge-patch+json'
      })
    };

    return this.http.patch(environnement.BASE_URL + `api/trade/${modifiedTrade.id}`, modifiedTrade, httpOptions);
  }


}
