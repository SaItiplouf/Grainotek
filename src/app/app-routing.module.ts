import { NgModule } from '@angular/core';
import {RouterModule, Routes} from "@angular/router";

// Component list :
import {IndexParentComponent} from "./component/pages/IndexParent/index-parent.component";
import {SecondaryParentComponent} from "./component/pages/SecondaryParent/secondary-parent.component";
import {ProfileDashboardComponent} from "./component/pages/Profile-dashboard/profile-dashboard.component";


const routes: Routes = [
  { path: '', component: IndexParentComponent },
  { path: 'secondary', component: SecondaryParentComponent },
  { path: 'profile-dashboard', component: ProfileDashboardComponent },

];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule { }
