import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {SessionService} from "../../services/session.service";
import {IUser} from "../../models/user.model";
import {LoginDialogComponent} from "./login-dialog/login-dialog.component";
import {Store} from "@ngrx/store";
import {State} from "../../Reducers/app.reducer";
import {TradeService} from "../../services/trade.service";
import {ITrade} from "../../models/trade.model";
import {IPost} from "../../models/post.model";
import {PostService} from "../../services/post.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  jwtUserInfo: IUser | null = null;
  userInfo: IUser | null = null;
  applicantTrades: ITrade[] = [];
  userPostTrades: ITrade[] = [];

  constructor(private router: Router, private PostService: PostService, public dialog: MatDialog, private sessionService: SessionService, private tradeService: TradeService, private store: Store<{
    state: State
  }>) {
  }

  updateTradeStatut(trade: ITrade, statut: string): void {
    this.tradeService.updateTradeStatut(trade, statut)
      .subscribe(
        () => console.log("Il faut mettre à jour le trade, faire le Mercure, etc."),
        error => console.error('Erreur lors de l\'envoi du message:', error)
      );
  }

  acceptTrade(trade: ITrade, statut: string): void {
    this.updateTradeStatut(trade, statut);
    // Logique pour générer une room associé
  }

  ngOnInit(): void {
    this.store.select((state: any) => state.state).subscribe((state: State) => {
      console.log(state.user);
      this.userInfo = state.user;

      if (this.userInfo) {
        this.tradeService.getAllTradeFromAUser(this.userInfo).subscribe(response => {
          console.log(response)
          this.applicantTrades = response.applicant;
          this.userPostTrades = response.user_post;
        });
      }
    });
    console.log("C CE LOG TA MRERE", this.isUserLoggedIn());
  }

  openMail() {
    this.router.navigate(['pm']);
  }


  openPostDialog(post: IPost): void {
    this.PostService.DisplayPostModal(post)
  }

  // async initializeUserInfo() {
  //   this.jwtUserInfo = this.sessionService.getUserInfo();
  //
  //   if (this.jwtUserInfo) {
  //     try {
  //       this.userInfo = await this.sessionService.getUserInfoFromAPI(this.jwtUserInfo);
  //     } catch (error) {
  //       console.error("Error fetching user info from API:", error);
  //     }
  //   }
  // }


  isUserLoggedIn(): boolean {
    return this.sessionService.isUserLoggedIn();
  }

  forgetToken() {
    this.sessionService.forgetToken()
    console.log("Token deleted")
  }

  navigateToIndex() {
    this.router.navigate(['']).then(() => {
      console.log("Navigate Success")
    });
  }

  navigateToSecondary() {
    this.router.navigate(['secondary']).then(() => {
      console.log("Navigate Success")
    });
  }

  navigateToDash() {
    this.router.navigate(['profile-dashboard']).then(() => {
      console.log("Navigate Success")
    });
  }


  openLoginDialog(): void {
    this.dialog.open(LoginDialogComponent, {});
  }
}
