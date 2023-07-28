import { Component } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(private router: Router) { }
  navigateToIndex() {
    this.router.navigate(['']);
  }
  navigateToSecondary() {
    this.router.navigate(['secondary']);
  }
}
