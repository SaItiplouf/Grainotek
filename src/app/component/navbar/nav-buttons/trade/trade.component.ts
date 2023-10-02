import {Component, Input, OnInit} from '@angular/core';
import {IPost} from "../../../../models/post.model";
import {ITrade} from "../../../../models/trade.model";
import {IPostRoom, IRoom} from "../../../../models/room.model";
import {map} from "rxjs";
import {IUser} from "../../../../models/user.model";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {SessionService} from "../../../../services/session.service";
import {TradeService} from "../../../../services/ChatRelated/trade.service";
import {ToastrService} from "ngx-toastr";
import {RoomService} from "../../../../services/ChatRelated/room.service";
import {Store} from "@ngrx/store";
import {State} from "../../../../Reducers/app.reducer";
import {PostService} from "../../../../services/post.service";

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.scss']
})
export class TradeComponent implements OnInit {
  @Input() user: IUser | null = null;
  lastThreeTrades: ITrade[] = [];
  trades: ITrade[] = [];

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
    if (this.user) {
      this.tradeService.getAllTradeFromAUser(this.user).subscribe(response => {
        console.log(response)

        this.trades = [...response.user_post, ...response.applicant];

        this.lastThreeTrades = this.trades.filter(trade => {
          const isUserApplicant = trade.applicant.id === this.user!.id;
          const isUserPostOwner = trade.userPostOwner.id === this.user!.id;

          const isDeleted = isUserApplicant ? trade.applicantDeleted : isUserPostOwner ? trade.postOwnerDeleted : false;

          return !isDeleted;
        });

      });
    }
  }

  deleteTrade(trade: ITrade, user: IUser | null) {
    if (user === null) {
      return;
    }

    this.tradeService.updatePatchDeleted(trade, user!).subscribe(response => {
      console.log('Trade deleted', response);

      // Filtrer les trades via réponse api pour les supprimer
      this.lastThreeTrades = this.lastThreeTrades.filter(tradeItem => tradeItem.id !== response.id);
      this.trades = this.trades.filter(tradeItem => tradeItem.id !== response.id);
    }, error => {
      console.error('Error deleting trade', error);
    });
  }


  openPostDialog(post: IPost): void {
    console.log(post);
    this.PostService.DisplayPostModal(post)
  }


  leaveRating(trade: ITrade) {
    console.log("systeme de notations")
  }

  onShowMore() {
    this.router.navigate(['/']);
  }

  updateTrade(trade: ITrade, statut: string): void {
    this.tradeService.updateTrade(trade, statut)
      .subscribe(
        () => console.log("Il faut mettre à jour le trade, faire le Mercure, etc."),
        error => [this.toastr.error(error.error.detail)],
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
        this.tradeService.updateTrade(trade, statut, room);
      },
      error => {
        this.toastr.error(error.error.detail)
        console.log(error)
      }
    );

  }
}
