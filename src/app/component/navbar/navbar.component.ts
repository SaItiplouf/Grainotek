import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {SessionService} from "../../services/session.service";
import {IUser} from "../../models/user.model";
import {LoginDialogComponent} from "./login-dialog/login-dialog.component";
import {Store} from "@ngrx/store";
import {State} from "../../Reducers/app.reducer";
import {PostService} from "../../services/post.service";
import {ToastrService} from "ngx-toastr";
import {CreatePostComponent} from "../pages/IndexParent/Feed/createpost/createpost.component";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  userInfo: IUser | null = null;
  menuOpen!: boolean;

  constructor(private router: Router,
              private PostService: PostService,
              public dialog: MatDialog,
              private sessionService: SessionService,
              private toastr: ToastrService,
              private store: Store<{
                state: State
              }>) {

  }

  ngOnInit(): void {
    this.store.select((state: any) => state.state.user).subscribe((user: IUser) => {
      this.userInfo = user;
    });
    this.menuOpen = false;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  isUserLoggedIn(): boolean {
    return this.sessionService.isUserLoggedIn();
  }

  openDialog() {
    window.scrollTo(0, 0);
    this.dialog.open(CreatePostComponent, {
      autoFocus: false,
      width: "500px",
    });
  }


  navigateToDash() {
    this.router.navigate(['profile-dashboard']).then(() => {
      console.log("Navigate Success")
    });
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

  forgetToken() {
    this.toggleMenu();
    this.sessionService.forgetToken()
    console.log("Token deleted")
  }

  openLoginDialog(): void {
    this.dialog.open(LoginDialogComponent, {
      autoFocus: false,
    });
  }
}
