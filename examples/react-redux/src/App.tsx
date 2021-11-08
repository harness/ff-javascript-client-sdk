import { initialize, Event } from "@harnessio/ff-javascript-client-sdk";
import { useAppDispatch } from "./app/hooks";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { FeatureFlags } from "./ducks/models";
import { selectFeatureFlags } from "./ducks/selectors";
import { setFeatureFlags } from "./ducks/slice";

export const FeatureFlagsEngine: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentFeatureFlags: FeatureFlags = useSelector(selectFeatureFlags);

  useEffect(() => {
    const cf = initialize(
      '50e52f07-ec4b-4b4a-8743-fd5050c31e1c',
      { identifier: "Frontend", name: "Frontend" },
      { debug: true }
    );

    cf.on(Event.READY, (flags) => {
      dispatch(setFeatureFlags(flags));
    });

    cf.on(Event.CHANGED, (flagInfo) => {
      console.log("CHANGED", flagInfo);
      if (flagInfo.deleted) {
        const update = Object.assign({}, currentFeatureFlags);
        delete update[flagInfo.flag as keyof FeatureFlags];
        dispatch(setFeatureFlags(update));
      } else {
        dispatch(
          setFeatureFlags({
            ...currentFeatureFlags,
            [flagInfo.flag]: flagInfo.value,
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