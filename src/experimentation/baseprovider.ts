import { ExperimentProvider, ExperimentProviderConfig } from "./types";
import { Target, VariationValue } from "../types";

export default abstract class Provider implements ExperimentProvider {
  debug = false

  initialize(config: ExperimentProviderConfig) {
    this.debug = (config.debug != undefined) ? config.debug : false;
  }

  experiment(flagIdentifier: string, variation: VariationValue, target: Target) {
  }

}