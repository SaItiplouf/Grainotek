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
  @ViewChild('emailInput') emailInput!: ElementRef;
  @ViewChild('passwordInput') passwordInput!: ElementRef;
  username: string | undefined;
  email: string | undefined;
  password: string | undefined;
  pictureFile: any | undefined;
  isLoading = false;
  imagePreview: string | ArrayBuffer | null = null;

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
    if (this.email && this.password && this.username && !this.isLoading) {
      this.isLoading = true;

      const formData: FormData = new FormData();
      formData.append('email', this.email);
      formData.append('password', this.password);
      formData.append('username', this.username);

      if (this.pictureFile) {
        ("l'image est bien passé par la")
        formData.append('pictureFile', this.pictureFile);
      }

      this.sessionService.register(formData).subscribe(
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

  onFileChange(event: Event) {
    console.log('onFileChange a été appelé');
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      console.log('Fichier sélectionné:', input.files[0]);
      this.pictureFile = input.files[0];

      // Pour la prévisualisation de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('reader.onload a été appelé', reader.result);
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.pictureFile);
    }
  }

  focusInput(inputType: string): void {
    if (inputType === 'email') {
      this.passwordInput.nativeElement.focus();
    } else if (inputType === 'username') {
      this.emailInput.nativeElement.focus();
    }
  }
}
