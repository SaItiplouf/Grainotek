import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';
import {RouterOutlet} from "@angular/router";
import {StoreModule} from "@ngrx/store";
import {reducer} from "./Reducers/app.reducer";

import { IndexParentComponent } from './component/IndexParent/index-parent.component';
import { SecondaryParentComponent } from './component/SecondaryParent/secondary-parent.component';
import { FeedComponent } from './component/Feed/feed.component';
import { NavbarComponent } from './component/navbar/navbar.component';

@NgModule({
  declarations: [
    AppComponent,
    FeedComponent,
    NavbarComponent,
    IndexParentComponent,
    SecondaryParentComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterOutlet,
    HttpClientModule,
    StoreModule.forRoot({ State : reducer }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
