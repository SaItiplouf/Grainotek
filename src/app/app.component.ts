import {Component, OnInit} from '@angular/core';
import {initFlowbite} from 'flowbite';
import {SessionService} from "./services/session.service";
import {User} from "./models/user.model";
import {setUser} from "./actions/post.actions";
import {Store} from "@ngrx/store";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Grainotek';

  constructor(private sessionService: SessionService, private store: Store) {
  }

  ngOnInit(): void {
    initFlowbite();

    if (!this.sessionService.isTokenValid()) {
      this.sessionService.forgetToken()
    } else {
      let userJson = localStorage.getItem('localUser')
      if (userJson) {
        let user = User.fromJson(userJson)
        this.store.dispatch(setUser({user}))
      }
    }
  }
}
