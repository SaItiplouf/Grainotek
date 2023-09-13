import {createAction, props} from '@ngrx/store';
import {IRoom} from "../models/room.model";

export const roomsLoaded = createAction('[Room] Rooms Loaded', props<{ rooms: IRoom[] }>());
export const updateRoom = createAction(
  '[Chat] Update Room',
  props<{ room: IRoom }>()
);
