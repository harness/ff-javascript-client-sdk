import type { ExperimentProviderConfig } from "./types";
import type { Target, VariationValue } from "../types";
import { AnalyticsBrowser } from "@segment/analytics-next";
import BaseProvider from "./baseprovider";

export default class SegmentExperimentProvider extends BaseProvider{

  private analyics: AnalyticsBrowser;
  private experimentEvent: string;

  constructor() {
    super();
    this.name = "SegmentProvider";
  }

  initialize(config: ExperimentProviderConfig) {
    super.initialize(config);
    this.analyics = AnalyticsBrowser.load({writeKey:config.apiKey});
    if (config.extra && config.extra.experimentEvent) {
      this.experimentEvent = config.extraConfig.experimentEvent;
    } else {
      this.experimentEvent = '$exposure';
    }
    this.log(`Initializing the SEGMENT provider with ${config.apiKey}`);
  }

  startExperiment(flagIdentifier: string, variation: VariationValue, target?: Target) { 
    this.log(`Experimenting on amplitude for ${flagIdentifier} with variation ${variation}`);
    if (target) {
      this.log('Identifying the user');
      this.analyics.identify({
        target: {
          identifer: target.identifier,
          name: target.name
        }
      });
    }
    this.analyics.track(this.experimentEvent, {
        flag: flagIdentifier,
        variation: variation,
    });
  }

}

