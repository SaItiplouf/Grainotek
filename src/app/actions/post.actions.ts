import {createAction, props} from '@ngrx/store';
import {IPost} from '../models/post.model';
import {IUser} from "../models/user.model";

export const postsLoaded = createAction('[Post] Posts Loaded', props<{ posts: IPost[] }>());

// SYSTEME ENREGISTREMENT DU USER EN LOCAL
export const setUser = createAction("[User] Login", props<{ user: IUser }>());
export const addPost = createAction('[Post] Add Post', props<{ post: IPost }>());
