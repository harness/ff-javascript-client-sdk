import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import featureFlagsReducer from '../ducks/slice';

export const store = configureStore({
  reducer: {
    app: featureFlagsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
