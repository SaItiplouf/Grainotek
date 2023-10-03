import {createAction, props} from '@ngrx/store';
import {ITrade} from '../models/trade.model';

export const tradesLoaded = createAction(
  '[Trade API] Trades Loaded Success',
  props<{ trades: ITrade[] }>()
);

export const updateTrade = createAction(
  '[Trade API] Trade Updated Success',
  props<{ trade: ITrade }>()
);
export const deleteTrade = createAction(
  '[Trade API] Trade Deleted Success',
  props<{ trade: ITrade }>()
);
