import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {SessionService} from "../../services/session.service";
import {IUser} from "../../models/user.model";
import {LoginDialogComponent} from "./login-dialog/login-dialog.component";
import {Store} from "@ngrx/store";
import {State} from "../../Reducers/app.reducer";
import {ITrade} from "../../models/trade.model";
import {IPost} from "../../models/post.model";
import {PostService} from "../../services/post.service";
import {IPostRoom, IRoom} from "../../models/room.model";
import {map} from "rxjs";
import {RoomService} from "../../services/ChatRelated/room.service";
import {TradeService} from "../../services/ChatRelated/trade.service";

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

  constructor(private router: Router,
              private PostService: PostService,
              public dialog: MatDialog,
              private sessionService: SessionService,
              private tradeService: TradeService,
              private roomService: RoomService,
              private store: Store<{
                      state: State
                      }>) {}

  updateTrade(trade: ITrade, statut: string): void {
    this.tradeService.updateTrade(trade, statut)
      .subscribe(
        () => console.log("Il faut mettre à jour le trade, faire le Mercure, etc."),
        error => console.error('Erreur lors de l\'envoi du message:', error)
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
        console.error('Erreur lors de la création de la room voir erreur:', error);
      }
    );

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
