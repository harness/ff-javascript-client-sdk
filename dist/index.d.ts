import type { Options, Target, StreamEvent, EventOnBinding, EventOffBinding, Result, Evaluation, VariationValue } from './types';
import { Event } from './types';
declare const initialize: (apiKey: string, target: Target, options?: Options) => Result;
export { initialize, Options, Target, StreamEvent, Event, EventOnBinding, EventOffBinding, Result, Evaluation, VariationValue };
