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

    cf.on(Event.READY, (flags) => {
      console.log("Flags", flags);
      dispatch(setFeatureFlags(flags));
    });

    cf.on(Event.CHANGED, (flag) => {
      if (flag.deleted) {
        const update = Object.assign({}, currentFeatureFlags);
        delete update[flag.identifier as keyof FeatureFlags];
        dispatch(setFeatureFlags(update));
      } else {
        console.log("CHANGED", flag);
        dispatch(
          setFeatureFlags({
            ...currentFeatureFlags,
            [flag.identifier]: flag.value,
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