import { initialize, Event } from "@harnessio/ff-javascript-client-sdk";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { useEffect } from "react";
import { FeatureFlags } from "./ducks/models";
import { selectFeatureFlags } from "./ducks/selectors";
import { setFeatureFlags } from "./ducks/slice";

export const FeatureFlagsEngine: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFeatureFlags: FeatureFlags = useAppSelector(selectFeatureFlags);

  useEffect(() => {
    const cf = initialize(
      '58f2bc75-c785-4c2e-9f65-7b80c8da0169',
      { identifier: "Frontend", name: "Frontend" },
      { debug: true }
    );

    cf.on(Event.READY, (flags: string[]) => {
      const flagObjects = flags.reduce((obj, item) => {
        return {
          ...obj,
          [item]: undefined,
        };
      }, {})
      console.log("Flags", flagObjects);
      dispatch(setFeatureFlags(flagObjects));
    });

    cf.on(Event.CHANGED, (identifier: string) => {
      const value = cf.variation(identifier, undefined);
      if (value === undefined) {
        const update = Object.assign({}, currentFeatureFlags);
        delete update[identifier as keyof FeatureFlags];
        dispatch(setFeatureFlags(update));
      } else {
        dispatch(
          setFeatureFlags({
            ...currentFeatureFlags,
            [identifier]: value,
          })
        );
      }
    });

    cf.on(Event.ERROR, () => {
      console.error("Feature flags error");
    });

    return () => {
      cf.close();
    };
  }, []);

  return null;
};