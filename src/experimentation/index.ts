import type { ExperimentationOptions, ExperimentProvider } from "./types";
import NoOpExperimentProvider from "./noopprovider";
import AmplitudeExperimentProvider from "./amplitudeprovider";
import SegmentExperimentProvider from "./segmentprovider";
import { logError } from "../utils";

type ProviderSource = () => ExperimentProvider;

const providerMap: Map<string, ProviderSource> = new Map<string, ProviderSource>([
  ["noop", () => new NoOpExperimentProvider()],
  ["amplitude", () => new AmplitudeExperimentProvider()],
  ["segment", () => new SegmentExperimentProvider()]
]);

const loadProvider = (providerName: string): ExperimentProvider => {
  const providerKey = providerName.toLowerCase();
  if (!providerMap.has(providerKey)) {
    logError(`Unsupported experiment provider: ${providerName}. Will return NoOpExperimentProvider instead.`);
  }
  const providerSource = providerMap.get(providerKey) || providerMap.get("noop") as ProviderSource;
  return providerSource();
}

export const getProvider = (config: ExperimentationOptions): ExperimentProvider => {
  const provider = loadProvider(config.provider);
  if (provider !== undefined) {
    provider.initialize(config.config)
  }
  return provider
}

export const registerProvider = (providerName: string, providerSource: ProviderSource): boolean => {
  const providerKey = providerName.toLowerCase();
  // we don't allow users to replace existing provider
  if (providerMap.has(providerKey)) {
        logError(`Cannot replace existing provider ${providerName}.`);
        return false;
  }
  providerMap.set(providerKey, providerSource);
  return true;
}
