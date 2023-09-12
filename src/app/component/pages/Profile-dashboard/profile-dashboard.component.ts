import {Component, OnInit} from '@angular/core';
import {IUser} from '../../../models/user.model';
import {AppService} from "../../../services/app.service";
import {SessionService} from "../../../services/session.service";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import {State} from "../../../Reducers/app.reducer";
import {Store} from "@ngrx/store";

@Component({
  selector: 'app-profile-dashboard',
  templateUrl: './profile-dashboard.component.html',
  styleUrls: ['./profile-dashboard.component.scss']
})
export class ProfileDashboardComponent implements OnInit {
  jwtUserInfo: IUser | null = null;
  userInfo: IUser | null = null;
  updatedUsername: string | null = null;
  updatedEmail: string | null = null;


  constructor(private appService: AppService, private store: Store<{
    state: State
  }>, private sessionService: SessionService, private toastr: ToastrService, private router: Router) {
  }

  ngOnInit() {
    this.store.select((state: any) => state.state).subscribe((state: State) => {
      console.log(state.user)
      this.userInfo = state.user;
    });
    this.sessionService.checkUserAuthentication();
    this.sessionService.userLoggedOut.subscribe(() => {
      this.sessionService.checkUserAuthentication();
    });
  }


  // async initializeUserInfo() {
  //   this.jwtUserInfo = this.sessionService.getUserInfo();
  //
  //   if (this.jwtUserInfo) {
  //     try {
  //       this.userInfo = await this.sessionService.getUserInfoFromAPI(this.jwtUserInfo);
  //       console.log("Information User APi", this.userInfo)
  //     } catch (error) {
  //       console.error("Error fetching user info from API:", error);
  //     }
  //   }
  // }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        if (this.userInfo) {
          console.log(e.target.result)
          console.log(this.userInfo)


          this.appService.updateProfilePicture(this.userInfo.id, file)
            .subscribe(response => {
              this.toastr.success('Photo du profil mise à jour!', 'Succès');  // Alerte de succès

              console.log('Photo de profil mise à jour avec succès');
            });
        }
      };

      reader.readAsDataURL(file);
    }
  }

  updateProfile() {
    console.log("CC", this.userInfo);

    if (this.userInfo) {
      const updatedFields: any = {}; // Créez un objet vide pour stocker les champs mis à jour

      if (this.updatedEmail) {
        updatedFields.email = this.updatedEmail;
      }

      if (this.updatedUsername) {
        updatedFields.username = this.updatedUsername;
      }

      if (Object.keys(updatedFields).length > 0) {
        // Envoyez la requête PATCH uniquement si des champs ont été modifiés
        this.appService.updateUserInfo(this.userInfo.id, updatedFields)
          .subscribe(response => {
            console.log('Informations utilisateur mises à jour avec succès');
            this.toastr.success('Update des champs du profil réussie!', 'Succès');  // Alerte de succès
            // Mettre à jour les données du profil et rafraîchir l'affichage
            this.userInfo = {...this.userInfo, ...updatedFields}; // Mettre à jour avec les nouvelles données
            this.updatedUsername = null;
            this.updatedEmail = null;
          });
      } else {
        console.log('Aucun champ à mettre à jour');
      }
    }
  }

  updateUsername(newUsername: string) {
    this.updatedUsername = newUsername;
  }

  updateEmail(newEmail: string) {
    this.updatedEmail = newEmail;
  }
}
