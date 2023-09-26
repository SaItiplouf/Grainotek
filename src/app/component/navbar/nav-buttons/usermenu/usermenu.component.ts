import {Component, Input} from '@angular/core';
import {IUser} from "../../../../models/user.model";
import {Router} from "@angular/router";
import {SessionService} from "../../../../services/session.service";

@Component({
  selector: 'app-usermenu',
  templateUrl: './usermenu.component.html',
  styleUrls: ['./usermenu.component.scss']
})
export class UsermenuComponent {
  @Input() user: IUser | null = null;

  constructor(private router: Router,
              private sessionService: SessionService,
  ) {
  }


  @Input() navigateToIndex: () => void = () => {
  };

  navigateToDash() {
    this.router.navigate(['profile-dashboard']).then(() => {
      console.log("Navigate Success")
    });
  }

  forgetToken() {
    this.sessionService.forgetToken()
    console.log("Token deleted")
  }

}
