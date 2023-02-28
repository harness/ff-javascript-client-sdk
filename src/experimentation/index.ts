import { ExperimentationOptions, ExperimentProvider } from "./types";
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

const loadProvider = (providerType: string): ExperimentProvider => {
  const providerTypeKey = providerType.toLowerCase();
  if (!providerMap.has(providerTypeKey)) {
    logError(`Unsupported experiment provider: ${providerTypeKey}. Will return NoOpExperimentProvider instead.`);
  }
  const providerSource = providerMap.get(providerTypeKey) || providerMap.get("noop") as ProviderSource;
  return providerSource();
}

export const getProvider = (config: ExperimentationOptions): ExperimentProvider => {
  const provider = loadProvider(config.provider);
  if (provider !== undefined) {
    provider.initialize(config.config)
  }
  return provider
}
