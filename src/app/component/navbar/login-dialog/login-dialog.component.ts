import {Component, ElementRef, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {SessionService} from '../../../services/session.service';
import {RegisterDialogComponent} from "./register-dialog/register-dialog.component";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent {
  @ViewChild('usernameInput') usernameInput!: ElementRef;
  @ViewChild('passwordInput') passwordInput!: ElementRef;
  email: string | undefined;
  password: string | undefined;
  isLoading = false;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    private toastr: ToastrService,
    private sessionService: SessionService // Notez la convention de nommage ici
  ) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  openRegisterDialog(): void {
    this.dialogRef.close(); // Fermez le dialogue de connexion
    const dialogRef = this.dialog.open(RegisterDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      this.dialog.open(LoginDialogComponent);
    });
  }

  login(): void {
    if (this.email && this.password && !this.isLoading) {
      this.isLoading = true;
      this.sessionService.login(this.email, this.password).subscribe(
        (response: any) => {
          if (response) {
            // location.reload()
            this.dialogRef.close();
            this.toastr.success('Vous âtes connecté', 'Success')
          }
          this.isLoading = false; // Définissez isLoading sur false lorsque la requête est terminée
        },
        (error: any) => {
          console.log('ERREUR LOGIN DIALOG:', error);
          this.toastr.error(error.error.message, 'Erreur');
          this.isLoading = false; // Définissez isLoading sur false lorsque la requête est terminée
        }
      );
    }
  }

  focusPasswordInput(): void {
    this.passwordInput.nativeElement.focus();
  }
}
