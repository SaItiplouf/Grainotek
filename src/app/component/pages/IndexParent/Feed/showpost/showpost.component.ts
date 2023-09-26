import {Component, ElementRef, Inject, Input, OnInit, Renderer2, ViewChild} from '@angular/core';
import {IPost} from "../../../../../models/post.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {animate, keyframes, state, style, transition, trigger} from '@angular/animations';
import {SessionService} from "../../../../../services/session.service";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import * as CryptoJS from 'crypto-js';
import {Loader} from "@googlemaps/js-api-loader";
import {OwlOptions} from 'ngx-owl-carousel-o';
import {IUser} from "../../../../../models/user.model";
import {environnement} from "../../../../../../../environnement";
import {TradeService} from "../../../../../services/ChatRelated/trade.service";
import {CommentSectionComponent} from "./comment-section/comment-section.component";
import {PostService} from "../../../../../services/post.service";

@Component({
  selector: 'app-showpost',
  templateUrl: './showpost.component.html',
  styleUrls: ['./showpost.component.scss'],
  animations: [
    trigger('iconAnimation', [
      state('inactive', style({
        transform: 'scale(1)'
      })),
      state('active', style({
        transform: 'scale(1)'
      })),
      transition('inactive => active', animate('1s', keyframes([
        style({transform: 'rotate(-10deg) scale(1)', offset: 0.15}),
        style({transform: 'rotate(10deg) scale(1)', offset: 0.3}),
        style({transform: 'rotate(-5deg) scale(1)', offset: 0.45}),
        style({transform: 'rotate(5deg) scale(1)', offset: 0.6}),
        style({transform: 'rotate(0deg) scale(1.1)', offset: 0.75}),
        style({transform: 'rotate(0deg) scale(1)', offset: 1})
      ])))
    ])
  ]
})
export class ShowpostComponent implements OnInit {
  iconState = 'inactive';
  @Input() Modalpost: IPost;
  public location: { lat: number; lng: number } | undefined;
  public formattedTime: string;
  ConnectedUser!: IUser;
  showComments = false;
  @ViewChild(CommentSectionComponent) commentSectionComponent!: CommentSectionComponent;
  selector: string = ".main-panel";

  customOptions: OwlOptions = {
    loop: true,
    autoplay: true,
    mouseDrag: true,
    touchDrag: false,
    pullDrag: false,
    dots: true,
    navSpeed: 2200,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 1
      },
      740: {
        items: 1
      },
      940: {
        items: 1
      }
    },
    nav: false
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { post: IPost, formattedTime: string },
    private dialogRef: MatDialogRef<ShowpostComponent>,
    private el: ElementRef,
    private renderer: Renderer2,
    private sessionService: SessionService,
    private toastr: ToastrService,
    private tradeService: TradeService,
    private router: Router,
    private postService: PostService
  ) {
    this.Modalpost = data.post;
    this.formattedTime = data.formattedTime;
  }

  ngOnInit(): void {
    if (this.Modalpost.location) {
      const [latStr, lngStr] = this.Modalpost.location.split(',');
      this.location = {
        lat: parseFloat(latStr),
        lng: parseFloat(lngStr)
      };
      this.initMap();
    }
    this.getConnectedUserInformationViaToken()
  }

  getConnectedUserInformationViaToken() {
    const ConnectedUser = this.sessionService.getUserInfo();
    if (ConnectedUser) {
      this.ConnectedUser = ConnectedUser;
    } else {
      return
    }
  }

  isUserLoggedIn(): boolean {
    return this.sessionService.isUserLoggedIn();
  }

  onButtonClick(event: MouseEvent) {
    this.iconState = this.iconState === 'inactive' ? 'active' : 'inactive';
    this.addRippleEffect(event);

    this.trade();
  }

  deletePost() {
    const storedData = localStorage.getItem("jwt");
    if (!storedData) {
      this.toastr.error("Données JWT non trouvées");
      console.error("Données JWT non trouvées");
      return;
    }
    const parsedData = JSON.parse(storedData);
    const jwt = parsedData.token;
    
    console.log(jwt)
    this.postService.deletePost(this.Modalpost, jwt).subscribe(
      response => {
        console.log('Post supprimé avec succès.');
      },
      error => {
        console.error('Erreur lors de la suppression du post:', error);
      }
    );
  }

  close() {
    this.dialogRef.close();
  }

  trade(): void {
    const sessionUser = JSON.parse(localStorage.getItem("localUser") as string);
    console.log("log test trade sessionuser", sessionUser)
    const statut = "pending";

    this.tradeService.createTrade({
      applicant: sessionUser,
      userPostOwner: this.Modalpost.user,
      post: this.Modalpost,
      statut: statut
    }).subscribe(response => {
      this.toastr.success('Le trade a été créé', 'Réussi');
      console.log(response);
    }, error => {
      console.error('Erreur trade', error);
      if (error && error.error && error.error.detail) {
        this.toastr.error(error.error.detail, 'Erreur');
      } else {
        this.toastr.error('Une erreur s\'est produite.', 'Erreur');
      }
    });
  }

  redirectToProfile(userId: number): void {
    this.close();
    const userIdString = userId.toString();

    const encryptedId = CryptoJS.AES.encrypt(userIdString, 'clé secrète').toString();

    const encodedEncryptedId = encodeURIComponent(encryptedId);

    this.router.navigate([`/profile/${encodedEncryptedId}`]);
  }


  async initMap(): Promise<void> {
    const mapElement = document.getElementById('map');
    if (mapElement && this.location) {

      const loader = new Loader({
        apiKey: environnement.GOOGLE_API_KEY,
        version: 'weekly'
      });

      await loader.load();

      const map = new google.maps.Map(mapElement, {
        center: {lat: this.location.lat, lng: this.location.lng},
        zoom: 12
      });

      const marker = new google.maps.Marker({
        position: {lat: this.location.lat, lng: this.location.lng},
        map: map,
        title: 'Emplacement du poste'
      });
    }
  }

  addRippleEffect(event: MouseEvent) {
    const button: HTMLElement = this.el.nativeElement.querySelector('#trade-btn');
    const ripple = this.renderer.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(20, 20);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    this.renderer.setStyle(ripple, 'width', `${size}px`);
    this.renderer.setStyle(ripple, 'height', `${size}px`);
    this.renderer.setStyle(ripple, 'left', `${x}px`);
    this.renderer.setStyle(ripple, 'top', `${y}px`);
    this.renderer.addClass(ripple, 'ripple');

    this.renderer.appendChild(button, ripple);

    ripple.addEventListener('animationend', () => {
      this.renderer.removeChild(button, ripple);
      const tickIcon = button.querySelector('.tick-icon');
      this.renderer.setStyle(tickIcon, 'display', 'inline-block');
    });
  }
}


