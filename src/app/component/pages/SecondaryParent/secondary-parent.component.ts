import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-secondary-parent',
  templateUrl: './secondary-parent.component.html',
  styleUrls: ['./secondary-parent.component.scss']
})
export class SecondaryParentComponent implements OnInit {
  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    // Préchargez l'image de fond en utilisant HttpClient
    this.http.get('../../../../assets/seeds-bg.jpg', {responseType: 'blob'}).subscribe(
      (data) => {
        console.log('Image préchargée avec succès');
      },
      (error) => {
        console.error('Erreur lors du préchargement de l\'image', error);
      }
    );
  }
}
