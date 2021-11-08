import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FeatureFlags } from "./models";

const initialState = {
  featureFlags: {}
};

export const flagSlice = createSlice({
    name: 'flags',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
      setFeatureFlags: (state: any, action: PayloadAction<FeatureFlags>) => {
        state.featureFlags = action.payload;
        return state;
      }
    },
  });

export const { setFeatureFlags } = flagSlice.actions;

export default flagSlice.reducer;