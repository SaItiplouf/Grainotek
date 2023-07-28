import { NgModule } from '@angular/core';
import {RouterModule, Routes} from "@angular/router";

// Component list :
import {IndexParentComponent} from "./component/IndexParent/index-parent.component";
import {SecondaryParentComponent} from "./component/SecondaryParent/secondary-parent.component";


const routes: Routes = [
  { path: '', component: IndexParentComponent, },
  { path: 'secondary', component: SecondaryParentComponent, },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule { }
