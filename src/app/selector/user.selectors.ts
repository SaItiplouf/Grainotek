import { createFeatureSelector, createSelector } from '@ngrx/store';
import {State} from "../Reducers/app.reducer";

const selectFeature = createFeatureSelector<{ state: State }>('state');

export const selectUser = createSelector(
  selectFeature,
  (state) => state.state.user
);
