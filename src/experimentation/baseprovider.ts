import { ExperimentProvider, ExperimentProviderConfig } from "./types";
import { Target, VariationValue } from "../types";

export default abstract class BaseProvider implements ExperimentProvider {
  
  protected debug = false

  initialize(config: ExperimentProviderConfig) {
    this.debug = (config.debug !== undefined) ? config.debug : false;
  }

  abstract startExperiment(flagIdentifier: string, variation: VariationValue, target: Target): void;

}
