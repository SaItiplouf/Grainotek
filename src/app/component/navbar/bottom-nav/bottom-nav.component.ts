import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {SessionService} from "../../../services/session.service";
import {CreatePostComponent} from "../../pages/IndexParent/Feed/createpost/createpost.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss']
})
export class BottomNavComponent implements OnInit {

  constructor(
    private router: Router,
    private sessionService: SessionService,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isDefaultRoute();
      }
    });
  }

  isUserLoggedIn(): boolean {
    return this.sessionService.isUserLoggedIn();
  }

  isDefaultRoute() {
    const defaultRoute = '/';
    return this.router.url === defaultRoute;
  }

  openDialog() {
    window.scrollTo(0, 0);
    this.dialog.open(CreatePostComponent, {
      autoFocus: false,
      width: "500px",
    });
  }

  navigateToIndex() {
    this.router.navigate(['']).then(() => {
      console.log("Navigate Success")
    });
  }

  navigateToTrade() {
    this.router.navigate(['trade']).then(() => {
      console.log("Navigate Success")
    });
  }

  navigateToChat() {
    this.router.navigate(['pm']).then(() => {
      console.log("Navigate Success")
    });
  }
}
