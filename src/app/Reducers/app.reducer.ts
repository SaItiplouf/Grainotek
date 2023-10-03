import {createReducer, on} from '@ngrx/store';
import {IPost} from "../models/post.model";
import {addComment, addPost, loadComments, postsLoaded, setUser} from "../actions/post.actions";
import {IUser} from "../models/user.model";
import {IRoom} from "../models/room.model";
import {addLikeToComment, roomsLoaded, updateRoom} from "../actions/chat.actions";
import {IPostComment} from "../models/postcomment.model";
import {ITrade} from "../models/trade.model";
import {deleteTrade, tradesLoaded, updateTrade} from "../actions/trade.actions";


export interface State {
  posts: IPost[];
  user: IUser | null;
  room: IRoom[];
  comments: IPostComment[];
  trades: ITrade[];
}

const localStorageUser = localStorage.getItem('localUser');
let initialUser: IUser | null = null;
if (localStorageUser) {
  initialUser = JSON.parse(localStorageUser);
}
export const initialState: State = {
  posts: [],
  user: initialUser,
  room: [],
  comments: [],
  trades: [],
};

export const reducer = createReducer(
  initialState,
  on(postsLoaded, (state, {posts}) => ({...state, posts})),
  // SYSTEME DENREGISTREMENT LOCAL DU USER
  on(setUser, (state, {user}) => {
    localStorage.setItem('localUser', JSON.stringify(user));
    return {...state, user};
  }),
  on(addPost, (state, {post}) => {
    console.log(state, state.posts);
    return {
      ...state,
      posts: [post, ...state.posts]
    };
  }),
  on(updateRoom, (state, {room}) => {
    const updatedRooms = state.room.map(existingRoom => {
      if (existingRoom.id === room.id) {
        return room;
      }
      return existingRoom;
    });
    return {...state, room: updatedRooms};
  }),
  on(addLikeToComment, (state, {commentId, like}) => {
    return {
      ...state,
      comments: state.comments.map(comment => {
        if (comment.id === commentId) {
          // Vérifie si l'utilisateur a déjà "liké" le commentaire
          const existingLikeIndex = comment.postCommentLikes.findIndex(l => l.user.id === like.user.id);

          let newPostCommentLikes;
          if (existingLikeIndex >= 0) {
            if (like.liked) {
              // Si l'utilisateur a "liké" à nouveau, mettez simplement à jour le like existant
              newPostCommentLikes = [
                ...comment.postCommentLikes.slice(0, existingLikeIndex),
                like,
                ...comment.postCommentLikes.slice(existingLikeIndex + 1)
              ];
            } else {
              // Si l'utilisateur a "déliké", supprimez le like existant
              newPostCommentLikes = [
                ...comment.postCommentLikes.slice(0, existingLikeIndex),
                ...comment.postCommentLikes.slice(existingLikeIndex + 1)
              ];
            }
          } else {
            // Si l'utilisateur n'a jamais "liké" auparavant, ajoutez simplement le nouveau like
            newPostCommentLikes = [...comment.postCommentLikes, like];
          }

          return {
            ...comment,
            postCommentLikes: newPostCommentLikes,
            likeCount: (comment.likeCount || 0) + (like.liked ? 1 : -1)
          };
        }
        return comment;
      })
    };
  }),
  on(roomsLoaded, (state, {rooms}) => ({...state, room: rooms})),
  on(loadComments, (state, {comments}) => ({
    ...state,
    comments: [...state.comments, ...comments]
  })),
  on(addComment, (state, {comment}) => ({...state, comments: [comment, ...state.comments]})),
  on(tradesLoaded, (state, {trades}) => ({...state, trades})),
  on(deleteTrade, (state, {trade}) => {
    const updatedTrades = state.trades.filter(existingTrade => existingTrade.id !== trade.id);
    return {...state, trades: updatedTrades};
  }),
  on(updateTrade, (state, {trade}) => {
    const updatedTrades = state.trades.map(existingTrade => {
      if (existingTrade.id === trade.id) {
        return trade;
      }
      return existingTrade;
    });
    return {...state, trades: updatedTrades};
  }),
);
