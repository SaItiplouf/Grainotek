import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {RoomSidebarComponent} from "../room-sidebar/room-sidebar.component";
import {TradeService} from "../../../../services/ChatRelated/trade.service";
import {IRoom} from "../../../../models/room.model";
import {ITrade} from "../../../../models/trade.model";
import {Store} from "@ngrx/store";
import {State} from "../../../../Reducers/app.reducer";
import {updateRoom} from "../../../../actions/chat.actions";
import {updateTrade} from "../../../../actions/trade.actions";

@Component({
  selector: 'app-deletetradedialog',
  templateUrl: './deletetradedialog.component.html',
  styleUrls: ['./deletetradedialog.component.scss']
})
export class DeletetradedialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { room: IRoom, trade: ITrade },
    public dialogRef: MatDialogRef<RoomSidebarComponent>,
    private tradeService: TradeService,
    private store: Store<{
      state: State
    }>
  ) {
  }

  ngOnInit() {
    console.log(this.data.trade)
  }

  onCancel() {
    this.dialogRef.close();
  }

  onConfirm() {
    this.tradeService.updateTrade(this.data.trade, "closed").subscribe(
      response => {
        console.log("Réponse de la mise à jour du commerce :", response);

        // Créer une nouvelle instance de la room avec le statut mis à jour
        const updatedRoom = { ...this.data.room, trade: { ...this.data.room.trade, statut: "closed" } };

        // Dispatch de l'action updateRoom avec la nouvelle instance
        this.store.dispatch(updateRoom({ room: updatedRoom }));
        this.store.dispatch(updateTrade({ trade: response}));
        this.dialogRef.close();
      },
      error => {
        console.error("Une erreur s'est produite lors de la mise à jour du commerce :", error);
        this.dialogRef.close();
      }
    );
  }
}
