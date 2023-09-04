import {Component, ElementRef, Inject, OnInit, Renderer2} from '@angular/core';
import {IPost} from "../../../../../models/post.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {animate, keyframes, state, style, transition, trigger} from '@angular/animations';
import {SessionService} from "../../../../../services/session.service";
import {TradeService} from "../../../../../services/trade.service";
import {ToastrService} from "ngx-toastr";

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
  public post: IPost;
  public location: { lat: number; lng: number } | undefined;
  public formattedTime: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { post: IPost, formattedTime: string },
    private dialogRef: MatDialogRef<ShowpostComponent>,
    private el: ElementRef,
    private renderer: Renderer2,
    private sessionService: SessionService,
    private toastr: ToastrService,
    private tradeService: TradeService
  ) {
    this.post = data.post;
    this.formattedTime = data.formattedTime;
  }


  ngOnInit(): void {
    if (this.post.location) {
      const [latStr, lngStr] = this.post.location.split(',');
      this.location = {
        lat: parseFloat(latStr),
        lng: parseFloat(lngStr)
      };
      this.initMap();
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

  close() {
    this.dialogRef.close();
  }

  trade(): void {
    const postOwnerUserURI = `/api/users/${this.post.user.id}`;

    const sessionUser = JSON.parse(localStorage.getItem("localUser") as string);
    const applicantURI = `/api/users/${sessionUser.id}`;

    const postURI = `/api/posts/${this.post.id}`;

    const statut = "pending";

    this.tradeService.createTrade({
      applicant: applicantURI,
      userPostOwner: postOwnerUserURI,
      post: postURI,
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

  initMap(): void {
    const mapElement = document.getElementById('map');
    if (mapElement && this.location) {
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
