import type { ExperimentProvider, ExperimentProviderConfig } from "./types";
import type { Target, VariationValue } from "../types";

export default abstract class BaseProvider implements ExperimentProvider {

  protected debug = false;
  name = "BaseProvider";

  initialize(config: ExperimentProviderConfig) {
    this.debug = (config != undefined && config.debug !== undefined) ? config.debug : false;
  }

  abstract startExperiment(flagIdentifier: string, variation: VariationValue, target: Target): void;

  protected log(message: string) {
    if (this.debug) {
      console.log(message);
    }
  }

}
