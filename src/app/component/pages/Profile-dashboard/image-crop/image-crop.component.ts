import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-image-crop',
  templateUrl: './image-crop.component.html',
  styleUrls: ['./image-crop.component.scss']
})
export class ImageCropComponent {
  croppedImage: any = '';

  constructor(
    public dialogRef: MatDialogRef<ImageCropComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { event: any }
  ) {
    console.log(this.data.event);
  }

  imageCropped(event: any) {
    console.log("Événement de rognage déclenché", event);
    this.croppedImage = event.blob;
    console.log(this.croppedImage)
  }

  close(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    if (this.croppedImage) {
      this.dialogRef.close(this.croppedImage);
    } else {
      alert("Veuillez rogner l'image avant de confirmer.");
    }
  }
}
