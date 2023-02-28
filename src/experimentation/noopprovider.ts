import type { ExperimentProviderConfig } from "./types";
import type { Target, VariationValue } from "../types";
import BaseProvider from "./baseprovider";

export default class NoOpExperimentProvider extends BaseProvider {

  constructor() {
    super();
    this.name = "NoOpProvider";
  }

  initialize(config: ExperimentProviderConfig) {
    super.initialize(config);
    if (this.debug) {
      console.log(`*** Initializing the NOOP provider with ${config.apiKey} ***`);
    }
  }

  startExperiment(flagIdentifier: string, variation: VariationValue, _target?: Target) {
    if (this.debug) {
      console.log(`*** NOOP Experiment for ${flagIdentifier} with variation ${variation} ***`);
    }
  }

}
