import {Component} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-messagerie',
  templateUrl: './messagerie.component.html',
  styleUrls: ['./messagerie.component.scss']
})
export class MessagerieComponent {
  constructor(private router: Router,
  ) {
  }

  openMail() {
    this.router.navigate(['pm']);
  }
}
