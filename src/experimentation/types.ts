import type { Target, VariationValue } from "../types";

export interface ExperimentProvider {
  initialize(config: ExperimentProviderConfig): void
  startExperiment(flagIdentifier: string, variation: VariationValue, target: Target): void
}

export interface ExperimentProviderConfig {
  apiKey?: string
  url?: string
  debug?: boolean
  serverUrl?: string
}

export interface ExperimentationOptions {
  provider: string
  config?: ExperimentProviderConfig
}
