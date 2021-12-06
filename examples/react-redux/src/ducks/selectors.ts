import { RootState } from "../app/store";
import { FeatureFlags } from "./models";

export const selectFeatureFlags = (state: RootState): FeatureFlags => state.app.featureFlags;