import {Component, Input, OnInit} from '@angular/core';
import {State} from "../../../../../../Reducers/app.reducer";
import {CommentsService} from "../../../../../../services/comments.service";
import {Store} from "@ngrx/store";
import {addComment, loadComments} from "../../../../../../actions/post.actions";
import {IPost} from "../../../../../../models/post.model";
import {IPostComment, IPostPostComment} from "../../../../../../models/postcomment.model";
import {SessionService} from "../../../../../../services/session.service";
import {ToastrService} from "ngx-toastr";
import {IUser} from "../../../../../../models/user.model";
import {addLikeToComment} from "../../../../../../actions/chat.actions";
import {map} from "rxjs";
import {ShowpostComponent} from "../showpost.component";

@Component({
  selector: 'app-comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss']
})
export class CommentSectionComponent implements OnInit {
  comments: IPostComment[] = [];
  @Input() Modalpost!: IPost;
  loading = true;
  newCommentContent: string = '';
  connectedUser!: IUser;
  userLikedComments: { [commentId: number]: boolean } = {};
  animationStates: { [commentId: number]: boolean } = {};
  currentPage: number = 1;
  isOpen: boolean = false;

  constructor(
    private commentsService: CommentsService,
    private ShowpostComponent: ShowpostComponent,
    private sessionService: SessionService,
    private toastr: ToastrService,
    private store: Store<{
      state: State;
    }>
  ) {
  }

  ngOnInit() {
    try {
      this.isOpen = true;

      this.commentsService.getCommentsOfAPostFromApi(this.Modalpost, this.currentPage).subscribe((comments) => {
        const updatedComments = comments.map((comment) => ({
          ...comment,
          likeCount: (comment.postCommentLikes?.length > 0)
            ? comment.postCommentLikes.filter((like) => like.liked).length
            : 0,
        }));

        // Vérifiez d'abord si `this.connectedUser` et `this.connectedUser.id` existent
        if (this.connectedUser && this.connectedUser.id) {
          // Mise à jour de la variable userLikedComments
          updatedComments.forEach((comment) => {
            this.userLikedComments[comment.id] = comment.postCommentLikes?.some(
              (like) => like.user && like.user.id === this.connectedUser.id && like.liked
            ) || false; // par défaut à false si postCommentLikes est indéfini
          });
        }

        this.store.dispatch(loadComments({comments: updatedComments}));
        this.loading = false;
      });

      this.store.select((state: any) => state.state.comments)
        .pipe(
          map((comments: IPostComment[]) =>
            comments.filter(comment => comment.post && comment.post.id === this.Modalpost.id)
          )
        )
        .subscribe((filteredComments: IPostComment[]) => {
          this.comments = filteredComments;
        });

      this.store.select((state: any) => state.state.user).subscribe((user: IUser) => {
        this.connectedUser = user;
      });
    } catch (error) {
      console.error('Erreur:', error);
      this.loading = false;
    }
  }

  redirectToProfile(userId: number): void {
    this.ShowpostComponent.redirectToProfile(userId);
  }

  onScroll() {
    if (this.loading) {
      return;
    }

    this.loading = true;

    this.commentsService.getCommentsOfAPostFromApi(this.Modalpost, this.currentPage + 1).subscribe(
      (updatedComments) => {
        // Traitez les commentaires comme avant
        updatedComments = updatedComments.map(comment => ({
          ...comment,
          likeCount: comment.postCommentLikes?.filter(like => like.liked).length || 0,
        }));

        this.store.dispatch(loadComments({comments: updatedComments}));

        this.currentPage++;
        this.loading = false;
      },
      (error) => {
        console.error("Erreur lors du chargement des commentaires:", error);
        this.loading = false;
      }
    );
  }

  isUserLoggedIn(): boolean {
    return this.sessionService.isUserLoggedIn();
  }

  likeComment(user: IUser, postcomment: IPostComment) {
    const data = {
      user: user,
      postcomment: postcomment,
    };


    this.commentsService.likeComment(data).subscribe(
      (response) => {
        console.log('Réponse:', response);
        try {
          this.animationStates[postcomment.id] = true;
          setTimeout(() => {
            this.animationStates[postcomment.id] = false;
          }, 2000);

          this.store.dispatch(addLikeToComment({commentId: response.postcomment.id, like: response}));
          this.userLikedComments[response.postcomment.id] = response.liked;
        } catch (error) {
          console.log('Erreur', error);
        }
      },
      (error) => {
        console.error('Erreur:', error);
      }
    );
  }


  addComment() {
    if (this.connectedUser === null) {
      this.toastr.error("Vous n'êtes pas connecté");
    } else if (this.connectedUser && this.newCommentContent.trim()) {
      const newComment: IPostPostComment = {
        user: this.connectedUser,
        post: this.Modalpost,
        content: this.newCommentContent,
      };

      this.commentsService.createComment(newComment).subscribe((response: IPostComment) => {
        this.store.dispatch(addComment({comment: response}));
        this.newCommentContent = '';
        console.log(response);
        this.toastr.success("Commentaire ajouté");
      });
    } else {
      console.log("missing something");
    }
  }
}
