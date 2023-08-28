import {Component, OnInit} from '@angular/core';
import {SessionService} from "../../../services/session.service";
import {AppService} from "../../../services/app.service";

@Component({
  selector: 'app-index-parent',
  templateUrl: './index-parent.component.html',
  styleUrls: ['./index-parent.component.scss']
})
export class IndexParentComponent implements OnInit {

  constructor(private sessionService: SessionService, private AppService: AppService) {
  }

  ngOnInit() {
    console.log("LOGGED IN", this.sessionService.isUserLoggedIn())
  }


}
