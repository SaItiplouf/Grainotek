import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {AppService} from '../../../../../services/app.service';
import jwtDecode from 'jwt-decode';
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {PostService} from "../../../../../services/post.service";
import {addPost} from "../../../../../actions/post.actions";
import {Store} from "@ngrx/store";
import {State} from "../../../../../Reducers/app.reducer";
import {concatMap, map, Observable} from "rxjs";
import {Loader} from "@googlemaps/js-api-loader";
import {environnement} from "../../../../../../environnement";

@Component({
  selector: 'app-createpost',
  templateUrl: './createpost.component.html',
  styleUrls: ['./createpost.component.scss']
})

export class CreatePostComponent implements OnInit {
  @ViewChild('imageInput', {static: false}) imageInput!: ElementRef;
  tweetText: string = '';
  tweetName: string = '';
  images: File[] = []; // Utilisez le type 'File' pour stocker les images
  public location: string = '';
  public filteredLocations: string[] = [];

  constructor(private dialogRef: MatDialogRef<CreatePostComponent>, private PostService: PostService, private sanitizer: DomSanitizer, private AppService: AppService, private store: Store<{
    state: State
  }>) {
  }

  ngOnInit(): void {
    this.loadGoogleMapsAPI().then(() => {
      this.initAutocomplete();
    });
  }

  async loadGoogleMapsAPI() {
    const loader = new Loader({
      apiKey: environnement.GOOGLE_API_KEY,
      version: "weekly",
      libraries: ["places"]
    });
    await loader.load();
  }

  initAutocomplete() {

    const input = document.getElementById('location') as HTMLInputElement;
    const autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        this.location = `${place.geometry.location.lat()},${place.geometry.location.lng()}`;
      }
    });
  }

  getImageUrl(image: File): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(image));
  }

  handleImage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.images.push(file); // Ajoutez le fichier à la liste des images
    }
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
  }

  sendTweet() {
    try {
      const token: string | null = localStorage.getItem('jwt');

      if (!token) {
        console.error("Le jeton (token) n'a pas été trouvé dans le stockage local.");
        return;
      }

      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.id;

      const post: any = {
        user: `api/users/${userId}`,
        name: this.tweetName,
        content: this.tweetText,
        location: this.location,
        createdAt: new Date().toString(),
        images: this.images
      };

      this.PostService.createPost(post).pipe(
        concatMap(response => {
          const postId = response.id;
          return this.uploadImages(postId).pipe(
            // Mappez la réponse d'uploadImages pour inclure les informations de l'objet post
            map(uploadResponse => ({...response, images: uploadResponse})),
          );
        })
      ).subscribe(
        combinedResponse => {
          console.log('Post créé avec images:', combinedResponse);
          this.store.dispatch(addPost({post: combinedResponse}));
          this.close();
        },
        error => {
          console.error('Erreur lors de la création du post:', error);
        }
      );
    } catch {
      console.log("erreur avec la fonction sendtweet")
    }
  }

  uploadImages(postId: number): Observable<any> {
    const formData = new FormData();
    formData.append('post_id', postId.toString()); // Envoyer l'ID du poste avec les images
    let i = 1;
    for (const image of this.images) {
      formData.append(`file${i}`, image);
      i++
    }

    return this.PostService.uploadImages(formData); // Retourne l'observable
  }


  close() {
    this.dialogRef.close();
  }
}
