import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {SessionService} from "../../../../../services/session.service";
import {TradeService} from "../../../../../services/ChatRelated/trade.service";
import {ToastrService} from "ngx-toastr";
import {RoomService} from "../../../../../services/ChatRelated/room.service";
import {Store} from "@ngrx/store";
import {State} from "../../../../../Reducers/app.reducer";
import {ITrade} from "../../../../../models/trade.model";
import {PostService} from "../../../../../services/post.service";
import {IUser} from "../../../../../models/user.model";
import {IPost} from "../../../../../models/post.model";
import {RatingComponent} from "../rating/rating.component";
import {IPostRoom, IRoom} from "../../../../../models/room.model";
import {map} from "rxjs";
import {tap} from "rxjs/operators";
import {deleteTrade, updateTrade} from "../../../../../actions/trade.actions";

@Component({
  selector: 'app-showalltrade',
  templateUrl: './showalltrade.component.html',
  styleUrls: ['./showalltrade.component.scss']
})
export class ShowalltradeComponent implements OnInit {
  trades: ITrade[] = [];
  user: IUser | null = null;

  constructor(private router: Router,
              private PostService: PostService,
              public dialog: MatDialog,
              private sessionService: SessionService,
              private tradeService: TradeService,
              private toastr: ToastrService,
              private roomService: RoomService,
              private store: Store<{
                state: State
              }>) {
  }

  ngOnInit() {
    this.store.select((state: any) => state.state.trades).subscribe((trades: ITrade[]) => {
      this.trades = trades;
      console.log(this.trades)
    });
    this.sessionService.checkUserAuthentication();
    this.store.select((state: any) => state.state.user).subscribe((user: IUser) => {
      this.user = user;
    });
  }


  deleteTrade(trade: ITrade, user: IUser | null) {
    if (user === null) {
      return;
    }

    this.tradeService.updatePatchDeleted(trade, user!).subscribe(response => {
      console.log('Trade deleted', response);
      this.store.dispatch(deleteTrade({trade: response}));
      // Filtrer les trades via réponse api pour les supprimer
      // this.lastThreeTrades = this.lastThreeTrades.filter(tradeItem => tradeItem.id !== response.id);
      // this.trades = this.trades.filter(tradeItem => tradeItem.id !== response.id);
    }, error => {
      console.error('Error deleting trade', error);
    });
  }


  openPostDialog(post: IPost): void {
    console.log(post);
    this.PostService.DisplayPostModal(post)
  }


  leaveRating(trade: ITrade) {
    const user = this.user;
    if (user) {
      this.dialog.open(RatingComponent, {
        data: {trade, user},
        width: "80%",
        maxHeight: "90vh",
        autoFocus: false,
      });
    } else {
      console.log("Manque un user dans le rating")
    }
  }

  onShowMore() {
    this.router.navigate(['/trade']);
  }

  updateTrade(trade: ITrade, statut: string): void {
    this.tradeService.updateTrade(trade, statut)
      .subscribe(
        (updatedTrade: ITrade) => {
          // Créez un nouvel objet Trade avec le statut mis à jour
          const updatedTradeWithStatus = {...trade, statut: updatedTrade.statut};
          // Mettez à jour le state avec le trade mis à jour
          this.store.dispatch(updateTrade({trade: updatedTradeWithStatus}));
          console.log("Statut du trade mis à jour avec succès, effectuez les autres actions nécessaires (par exemple, Mercure).");
        },
        error => {
          this.toastr.error(error.error.detail);
          console.error("Erreur lors de la mise à jour du statut du trade : ", error);
        }
      );
  }

  acceptTrade(trade: ITrade, statut: string): void {
    const room: IPostRoom = {
      name: "Salle n°" + trade.id,
      trade: trade,
      users: [trade.applicant, trade.userPostOwner]
    };
    this.roomService.createRoom(room).pipe(
      map((response: any) => response as IRoom)
    ).subscribe(
      (room: IRoom) => {
        console.log("ppl")
        this.tradeService.updateTrade(trade, statut, room).pipe(
          tap(response => {
            console.log('Response:', response);
            // Mettez à jour le state avec la réponse du service
            this.store.dispatch(updateTrade({trade: response}));
          })
        ).subscribe(
          () => {
            console.log("Trade mis à jour avec succès après la création de la salle.");
          },
          error => {
            this.toastr.error(error.error.detail);
            console.error("Erreur lors de la mise à jour du trade après la création de la salle : ", error);
          }
        );
      },
      error => {
        this.toastr.error(error.error.detail);
        console.error("Erreur lors de la création de la salle : ", error);
      }
    );

  }
}
