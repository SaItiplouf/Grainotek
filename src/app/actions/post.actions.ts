import {createAction, props} from '@ngrx/store';
import {IPost} from '../models/post.model';
import {IUser} from "../models/user.model";
import {IPostComment} from "../models/postcomment.model";
import {IPostCommentLike} from "../models/postcommentLike.model";

export const postsLoaded = createAction('[Post] Posts Loaded', props<{ posts: IPost[] }>());

// SYSTEME ENREGISTREMENT DU USER EN LOCAL
export const setUser = createAction("[User] Login", props<{ user: IUser }>());
export const addPost = createAction('[Post] Add Post', props<{ post: IPost }>());

export const loadComments = createAction('[Comment] Add Comment', props<{ comments: IPostComment[] }>());
export const addComment = createAction('[Post] Add Comment', props<{ comment: IPostComment }>());

export const loadFavorites = createAction('[Favorite] Load Favorites', props<{ favorites: IPostCommentLike[] }>());

export const deletePost = createAction('[Post] Delete Post', props<{ postId: number }>());
