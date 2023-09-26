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
          likeCount: comment.postCommentLikes?.filter((like) => like.liked).length || 0,
        }));

        // Mise à jour de la variable userLikedComments
        updatedComments.forEach((comment) => {
          this.userLikedComments[comment.id] = comment.postCommentLikes.some(
            (like) => like.user.id === this.connectedUser.id && like.liked
          );
        });

        this.store.dispatch(loadComments({comments: updatedComments}));
        console.log(updatedComments);
        this.loading = false;
      });

      this.store.select((state: any) => state.state.comments).subscribe((comments: IPostComment[]) => {
        this.comments = comments;
        // Mise à jour de la variable userLikedComments lorsqu'il y a un changement dans les commentaires
        comments.forEach((comment) => {
          if (this.connectedUser) {
            this.userLikedComments[comment.id] = comment.postCommentLikes.some(
              (like) => like.user.id === this.connectedUser.id && like.liked
            );
          }
        });
      });

      this.getUserInfo();
    } catch (error) {
      console.error('Erreur:', error);
      this.loading = false;
    }
  }

  onScroll() {
    // Si les commentaires sont en cours de chargement, on sort de la fonction
    if (this.loading) {
      return;
    }

    // Indiquez que les commentaires sont en cours de chargement
    this.loading = true;

    this.commentsService.getCommentsOfAPostFromApi(this.Modalpost, this.currentPage + 1).subscribe(
      (updatedComments) => {
        updatedComments = updatedComments.map((comment) => ({
          ...comment,
          likeCount: comment.postCommentLikes?.filter((like) => like.liked).length || 0,
        }));

        // Mise à jour de la variable userLikedComments
        updatedComments.forEach((comment) => {
          this.userLikedComments[comment.id] = comment.postCommentLikes.some(
            (like) => like.user.id === this.connectedUser.id && like.liked
          );
        });

        // Ajouter les nouveaux commentaires à la liste existante
        this.comments = [...this.comments, ...updatedComments];

        this.currentPage++; // Incrémentez la page actuelle
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

  getUserInfo() {
    const connectedUser = this.sessionService.getUserInfo();
    if (connectedUser) {
      this.connectedUser = connectedUser;
    }
  }

  addComment() {
    const userFromService = this.sessionService.getUserInfo();

    if (userFromService === null) {
      this.toastr.error("Vous n'êtes pas connecté");
    } else if (userFromService && this.newCommentContent.trim()) {
      const newComment: IPostPostComment = {
        user: userFromService,
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
