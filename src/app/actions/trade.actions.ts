import {createAction, props} from '@ngrx/store';
import {ITrade} from '../models/trade.model';

export const updateTrade = createAction(
  '[Trade] Update Trade',
  props<{ trade: ITrade }>()
);
