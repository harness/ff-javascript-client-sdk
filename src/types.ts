export interface Target {
  identifier: string
  name?: string
  anonymous?: boolean
  attributes?: object
}

export interface StreamEvent {
  event: string
  domain: string
  identifier: string
  version: number
  evaluations?: Evaluation[]
}

export enum Event {
  READY = 'ready',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  FLAGS_LOADED = 'flags loaded',
  CACHE_LOADED = 'cache loaded',
  CHANGED = 'changed',
  ERROR = 'error',
  ERROR_METRICS = 'metrics error',
  ERROR_AUTH = 'auth error',
  ERROR_FETCH_FLAGS = 'fetch flags error',
  ERROR_FETCH_FLAG = 'fetch flag error',
  ERROR_STREAM = 'stream error'
}

// Used when callers, such as the Flutter SDK for Web, require to know if the variation failed
// and the default value was returned.
export type VariationValue = boolean | string | number | object | undefined

export interface VariationValueWithDebug {
  value: VariationValue
  isDefaultValue: boolean
}

export interface Evaluation {
  flag: string // Feature flag identifier
  identifier: string // variation identifier
  value: VariationValue // variation value
  kind: string // boolean | json | string | int
  deleted?: boolean // mark that feature flag is deleted
}

export interface EventCallbackMapping {
  [Event.READY]: (flags: Record<string, VariationValue>) => void
  [Event.CONNECTED]: () => void
  [Event.DISCONNECTED]: () => void
  [Event.FLAGS_LOADED]: (evaluations: Evaluation[]) => void
  [Event.CACHE_LOADED]: (evaluations: Evaluation[]) => void
  [Event.CHANGED]: (flag: Evaluation) => void
  [Event.ERROR]: (error: unknown) => void
  [Event.ERROR_AUTH]: (error: unknown) => void
  [Event.ERROR_FETCH_FLAGS]: (error: unknown) => void
  [Event.ERROR_FETCH_FLAG]: (error: unknown) => void
  [Event.ERROR_STREAM]: (error: unknown) => void
  [Event.ERROR_METRICS]: (error: unknown) => void
}

export type EventOnBinding = <K extends keyof EventCallbackMapping>(event: K, callback: EventCallbackMapping[K]) => void
export type EventOffBinding = <K extends keyof EventCallbackMapping>(
  event?: K,
  callback?: EventCallbackMapping[K]
) => void

export interface Result {
  on: EventOnBinding
  off: EventOffBinding
  variation:
    | ((identifier: string, defaultValue: any) => VariationValue)
    | ((identifier: string, defaultValue: any, withDebug: false) => VariationValue)
    | ((identifier: string, defaultValue: any, withDebug: true) => VariationValueWithDebug)
  close: () => void
  setEvaluations: (evaluations: Evaluation[]) => void
  registerAPIRequestMiddleware: (middleware: APIRequestMiddleware) => void
  refreshEvaluations: () => void
}

type FetchArgs = Parameters<typeof fetch>
export type APIRequestMiddleware = (req: FetchArgs) => FetchArgs

export interface Options {
  baseUrl?: string
  eventUrl?: string
  eventsSyncInterval?: number
  streamEnabled?: boolean
  allAttributesPrivate?: boolean
  privateAttributeNames?: string[]
  debug?: boolean
  cache?: boolean | CacheOptions
}

export interface MetricsInfo {
  featureIdentifier: string
  featureValue: any
  variationIdentifier: string
  count: number
  lastAccessed: number
}

export interface CacheOptions {
  ttl?: number
}
