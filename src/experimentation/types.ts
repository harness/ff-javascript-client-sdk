import type { Target, VariationValue } from "../types";

export interface ExperimentProvider {
  name: string
  initialize(config: ExperimentProviderConfig): void
  startExperiment(flagIdentifier: string, variation: VariationValue, target: Target): void
}

export interface ExperimentProviderConfig {
  apiKey?: string
  url?: string
  debug?: boolean
  serverUrl?: string
  extraConfig?: Map<string, any> // provider-specific config
}

export interface ExperimentationOptions {
  provider: string
  config?: ExperimentProviderConfig
}
