import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {ToastrModule} from "ngx-toastr";
import {DragDropModule} from '@angular/cdk/drag-drop';
import {GoogleMapsModule} from '@angular/google-maps';
import {AppComponent} from './app.component';

import {AppRoutingModule} from './app-routing.module';
import {RouterOutlet} from "@angular/router";
import {StoreModule} from "@ngrx/store";
import {reducer} from "./Reducers/app.reducer";

import {IndexParentComponent} from './component/pages/IndexParent/index-parent.component';
import {SecondaryParentComponent} from './component/pages/SecondaryParent/secondary-parent.component';
import {FeedComponent} from './component/pages/IndexParent/Feed/feed.component';
import {NavbarComponent} from './component/navbar/navbar.component';
import {JwtInterceptorInterceptor} from "./services/JwtInterceptor/jwt-interceptor.interceptor";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LoginDialogComponent} from './component/navbar/login-dialog/login-dialog.component';
import {NgOptimizedImage} from '@angular/common'

import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {RegisterDialogComponent} from './component/navbar/login-dialog/register-dialog/register-dialog.component';
import {CreatePostComponent} from './component/pages/IndexParent/Feed/createpost/createpost.component';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatOptionModule} from '@angular/material/core';
import {MatMenuModule} from '@angular/material/menu';

import {ProfileDashboardComponent} from './component/pages/Profile-dashboard/profile-dashboard.component';
import {ShowpostComponent} from './component/pages/IndexParent/Feed/showpost/showpost.component';
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {ChatParentComponent} from './component/pages/ChatParent/chat-parent.component';


@NgModule({
  declarations: [
    AppComponent,
    FeedComponent,
    NavbarComponent,
    IndexParentComponent,
    SecondaryParentComponent,
    LoginDialogComponent,
    RegisterDialogComponent,
    CreatePostComponent,
    ProfileDashboardComponent,
    ShowpostComponent,
    ChatParentComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterOutlet,
    HttpClientModule,
    StoreModule.forRoot({state: reducer}),
    BrowserAnimationsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    InfiniteScrollModule,
    MatButtonModule,
    FormsModule,
    ToastrModule.forRoot(),
    MatIconModule,
    MatCardModule,
    DragDropModule,
    MatAutocompleteModule,
    MatOptionModule,
    GoogleMapsModule,
    NgOptimizedImage,
    MatMenuModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptorInterceptor, multi: true},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
