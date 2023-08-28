import {Component, ElementRef, ViewChild} from '@angular/core';
import {SessionService} from '../../../../services/session.service';
import {MatDialogRef} from '@angular/material/dialog';
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-register-dialog',
  templateUrl: './register-dialog.component.html',
  styleUrls: ['./register-dialog.component.scss']
})
export class RegisterDialogComponent {


  @ViewChild('usernameInput') usernameInput!: ElementRef;
  @ViewChild('passwordInput') passwordInput!: ElementRef;
  email: string | undefined;
  password: string | undefined;
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<RegisterDialogComponent>,
    private toastr: ToastrService,
    private sessionService: SessionService // Notez la convention de nommage ici
  ) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  register(): void {
    if (this.email && this.password && !this.isLoading) {
      // let username = 'votre_username';
      // let pictureFile = 'votre_pictureFile';
      this.isLoading = true;
      this.sessionService.register(this.email, this.password).subscribe(
        (response: any) => {
          if (response) {
            this.toastr.success('Inscription réussie!', 'Succès');  // Alerte de succès
            this.dialogRef.close();
          }
          this.isLoading = false;
        },
        (error: any) => {
          console.log('ERREUR REGISTER DIALOG:', error);
          this.toastr.error('Erreur lors de l\'inscription.', 'Erreur');  // Alerte d'erreur
          this.isLoading = false;
        }
      );
    }
  }

  focusPasswordInput(): void {
    this.passwordInput.nativeElement.focus();
  }
}
