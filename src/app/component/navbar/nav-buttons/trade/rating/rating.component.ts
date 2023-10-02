import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {IUser} from "../../../../../models/user.model";
import {TradeService} from "../../../../../services/ChatRelated/trade.service";
import {IUserReview} from "../../../../../models/user_review.model";
import {ITrade} from "../../../../../models/trade.model";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss']
})
export class RatingComponent {
  rating: number = 0;
  stars: number[] = [1, 2, 3, 4, 5];
  trade: ITrade;
  user: IUser;
  targetedUser: IUser;
  note: string = '';

  constructor(
    public dialogRef: MatDialogRef<RatingComponent>,
    private tradeService: TradeService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.trade = data.trade;
    this.user = data.user;
    this.targetedUser = data.trade.applicant.id === this.user.id ? data.trade.userPostOwner : data.trade.applicant;
  }

  ngOnInit(): void {
  }

  submitRating(): void {
    const user_review: IUserReview = {
      stars: this.rating,
      note: this.note,
      trade: this.trade,
      user: this.user,
      targetedUser: this.targetedUser
    };
    console.log(user_review.targetedUser);

    this.tradeService.submitReview(user_review).subscribe(
      response => {
        console.log('Réponse de la soumission de l\'avis :', response);
        this.toastr.success("Review créé")
      },
      error => {
        this.toastr.error(error.error.detail)
        console.log(error)
      }
    );

    this.dialogRef.close();
  }

  rate(selectedRating: number): void {
    this.rating = selectedRating;
  }
}
