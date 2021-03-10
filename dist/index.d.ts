import 'cross-fetch';
import { Options, Target, StreamEvent, Event, EventCallback, Result, Evaluation, VariationValue } from './types';
declare const initialize: (apiKey: string, target: Target, options: Options) => Result;
export { initialize, Options, Target, StreamEvent, Event, EventCallback, Result, Evaluation, VariationValue };
