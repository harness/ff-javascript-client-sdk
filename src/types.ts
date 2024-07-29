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
  STOPPED = 'stopped',
  POLLING = 'polling',
  POLLING_STOPPED = 'polling stopped',
  FLAGS_LOADED = 'flags loaded',
  CACHE_LOADED = 'cache loaded',
  CHANGED = 'changed',
  ERROR = 'error',
  ERROR_CACHE = 'cache error',
  ERROR_METRICS = 'metrics error',
  ERROR_AUTH = 'auth error',
  ERROR_FETCH_FLAGS = 'fetch flags error',
  ERROR_FETCH_FLAG = 'fetch flag error',
  ERROR_STREAM = 'stream error'
}

export type VariationValue = boolean | string | number | object | undefined

// Used when callers, such as the Flutter SDK for Web, require to know if the variation failed
// and the default value was returned.
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

export type FetchFlagsResult = { type: 'success'; data: Evaluation[] } | { type: 'error'; error: any }

export interface EventCallbackMapping {
  [Event.READY]: (flags: Record<string, VariationValue>) => void
  [Event.CONNECTED]: () => void
  [Event.STOPPED]: () => void
  [Event.POLLING]: () => void
  [Event.POLLING_STOPPED]: () => void
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

export type VariationFn = {
  (identifier: string, defaultValue: any): VariationValue
  (identifier: string, defaultValue: any, withDebug?: boolean): VariationValue | VariationValueWithDebug
  (identifier: string, defaultValue: any, withDebug: false): VariationValue
  (identifier: string, defaultValue: any, withDebug: true): VariationValueWithDebug
}

export interface Result {
  on: EventOnBinding
  off: EventOffBinding
  variation: VariationFn
  close: () => void
  setEvaluations: (evaluations: Evaluation[]) => void
  registerAPIRequestMiddleware: (middleware: APIRequestMiddleware) => void
  refreshEvaluations: () => void
}

type FetchArgs = Parameters<typeof fetch>
export type APIRequestMiddleware = (req: FetchArgs) => FetchArgs

export interface Options {
  /**
   * Override the default base URL for the SDK to communicate with the Harness Feature Flags service.
   * @default https://config.ff.harness.io/api/1.0
   */
  baseUrl?: string
  /**
   * Override the default metrics URL for the SDK to communicate with the Harness Feature Flags
   * metrics service.
   * @default https://events.ff.harness.io/api/1.0
   */
  eventUrl?: string
  /**
   * The interval in milliseconds to sync metrics with the Harness Feature Flags metrics service.
   * @default 60000
   */
  eventsSyncInterval?: number
  /**
   * The interval in milliseconds to poll the Harness Feature Flags service for updates when polling is enabled
   * and streaming is disabled.
   * @default 60000
   */
  pollingInterval?: number
  /**
   * Whether to enable the streaming feature. If set to `false` and polling enabled, the SDK will use polling to
   * check for updates.
   * @default true
   */
  streamEnabled?: boolean
  /**
   * Whether to enable polling. If set to `false`, the SDK will not poll for updates.
   * @default false
   */
  pollingEnabled?: boolean
  /**
   * Whether to enable debug logging.
   * @default false
   */
  debug?: boolean
  /**
   * Whether to enable caching.
   * @default false
   */
  cache?: boolean | CacheOptions
  /**
   * Logger to use instead of the default console.log, console.error and console.info functions
   * @default console
   */
  logger?: Logger

  /**
   * By default, the stream will attempt to reconnect indefinitely if it disconnects. Use this option to limit
   * the number of attempts it will make.
   */
  maxStreamingRetries?: number; // add this line

}

export interface MetricsInfo {
  featureIdentifier: string
  featureValue: any
  variationIdentifier: string
  count: number
  lastAccessed: number
}

export interface SyncStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

export interface AsyncStorage {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

export interface CacheOptions {
  /**
   * Time to live in milliseconds
   * @default Infinity
   */
  ttl?: number
  /**
   * Storage to use for caching
   * @default localStorage
   */
  storage?: AsyncStorage | SyncStorage
}

export interface Logger {
  debug: (...data: any[]) => void
  error: (...data: any[]) => void
  warn: (...data: any[]) => void
  info: (...data: any[]) => void
}
