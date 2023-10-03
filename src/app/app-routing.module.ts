import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";

// Component list :
import {IndexParentComponent} from "./component/pages/IndexParent/index-parent.component";
import {SecondaryParentComponent} from "./component/pages/SecondaryParent/secondary-parent.component";
import {ProfileDashboardComponent} from "./component/pages/Profile-dashboard/profile-dashboard.component";
import {ChatParentComponent} from "./component/pages/ChatParent/chat-parent.component";
import {ProfileParentComponent} from "./component/pages/Profile/profile-parent/profile-parent.component";
import {ShowalltradeComponent} from "./component/navbar/nav-buttons/trade/showalltrade/showalltrade.component";


const routes: Routes = [
  {path: '', component: IndexParentComponent},
  {path: 'secondary', component: SecondaryParentComponent},
  {path: 'profile-dashboard', component: ProfileDashboardComponent},
  {path: 'pm', component: ChatParentComponent},
  {path: 'profile/:userId', component: ProfileParentComponent},
  {path: 'trade', component: ShowalltradeComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule {
}
