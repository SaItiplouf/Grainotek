import {createReducer, on} from '@ngrx/store';
import {IPost} from "../models/post.model";
import {addPost, loadPosts, postsLoaded, setUser} from "../actions/post.actions";
import {IUser} from "../models/user.model";


export interface State {
  posts: IPost[];
  user: IUser | null;
}

const localStorageUser = localStorage.getItem('localUser');
let initialUser: IUser | null = null;
if (localStorageUser) {
  initialUser = JSON.parse(localStorageUser);
}
export const initialState: State = {
  posts: [],
  user: initialUser,
};

export const reducer = createReducer(
  initialState,
  on(loadPosts, (state) => ({...state})),
  on(postsLoaded, (state, {posts}) => ({...state, posts})),
  // SYSTEME DENREGISTREMENT LOCAL DU USER
  on(setUser, (state, {user}) => {
    localStorage.setItem('localUser', JSON.stringify(user));
    return {...state, user};
  }),
  on(addPost, (state, {post}) => {
    console.log(state, state.posts)
    return {
      ...state,
      posts: [...state.posts, post]
    };
  })
);
