import {createAction, props} from '@ngrx/store';
import {IRoom} from "../models/room.model";
import {IPostCommentLike} from "../models/postcommentLike.model";
import {IPostComment} from "../models/postcomment.model";

export const roomsLoaded = createAction('[Room] Rooms Loaded', props<{ rooms: IRoom[] }>());
export const updateRoom = createAction(
  '[Chat] Update Room',
  props<{ room: IRoom }>()
);
export const addLikeToComment = createAction(
  '[Comment] Add Like',
  props<{ commentId: number, like: IPostCommentLike }>()
);

export const addRoom = createAction(
  '[Room] Add Room',
  props<{ room: IRoom }>()
);
export const selectRoom = createAction(
  '[Room] Select Room',
  props<{ room: IRoom | null }>()
);
