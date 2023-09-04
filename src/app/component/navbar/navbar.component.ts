import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {SessionService} from "../../services/session.service";
import {IUser} from "../../models/user.model";
import {LoginDialogComponent} from "./login-dialog/login-dialog.component";
import {Store} from "@ngrx/store";
import {State} from "../../Reducers/app.reducer";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  jwtUserInfo: IUser | null = null;
  userInfo: IUser | null = null;


  constructor(private router: Router, public dialog: MatDialog, private sessionService: SessionService, private store: Store<{
    state: State
  }>) {
  }


  ngOnInit(): void {
    this.store.select((state: any) => state.state).subscribe((state: State) => {
      console.log(state.user)
      this.userInfo = state.user;
    });
    console.log("C CE LOG TA MRERE", this.isUserLoggedIn())
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
