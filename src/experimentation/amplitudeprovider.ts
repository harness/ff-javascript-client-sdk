import type { ExperimentProviderConfig } from "./types";
import type { Target, VariationValue } from "../types";
import { AnalyticsBrowser } from "@segment/analytics-next";
import BaseProvider from "./baseprovider";

export default class AmplitudeExperimentProvider extends BaseProvider{

  private analyics: AnalyticsBrowser;

  constructor() {
    super();
    this.name = "AmplitudeProvider";
  }

  initialize(config: ExperimentProviderConfig) {
    super.initialize(config);
    this.analyics = AnalyticsBrowser.load({writeKey:config.apiKey});
    console.log(`Initializing the AMPLITUDE provider with ${config.apiKey}`);
  }

  startExperiment(flagIdentifier: string, variation: VariationValue, target?: Target) {
    console.log(`Experimenting on amplitude for ${flagIdentifier} with variation ${variation}`);
    if (target) {
      console.log('Identifying the user');
      this.analyics.identify({
        target: {
          identifer: target.identifier,
          name: target.name
        }
      });
    }
    this.analyics.track('Experiment', {
        flag: flagIdentifier,
        variation: variation,
    });
  }

}
