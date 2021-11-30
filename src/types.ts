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
}

export enum Event {
  READY = 'ready',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CHANGED = 'changed',
  ERROR = 'error'
}

export type VariationValue = boolean | string | number | object | undefined

export interface Evaluation {
  flag: string          // Feature flag identifier
  identifier: string    // variation identifier
  value: VariationValue // variation value
  kind: string          // boolean | json | string | int
  deleted?: boolean     // mark that feature flag is deleted
}

export interface EventCallbackMapping {
  [Event.READY]: (flags: string[]) => void
  [Event.CONNECTED]: () => void
  [Event.DISCONNECTED]: () => void
  [Event.CHANGED]: (flag: string) => void
  [Event.ERROR]: (error: unknown) => void
}

export type EventOnBinding = <K extends keyof EventCallbackMapping>(event: K, callback: EventCallbackMapping[K]) => void
export type EventOffBinding = <K extends keyof EventCallbackMapping>(event?: K, callback?: EventCallbackMapping[K]) => void

export interface Result {
  on: EventOnBinding
  off: EventOffBinding
  variation: (identifier: string, defaultValue: any) => VariationValue
  close: () => void
}

export interface Options {
  baseUrl?: string
  eventUrl?: string
  streamEnabled?: boolean
  allAttributesPrivate?: boolean
  privateAttributeNames?: string[]
  debug?: boolean
}

export interface MetricsInfo {
  featureIdentifier: string;
  featureValue: any
  variationIdentifier: string;
  count: number
  lastAccessed: number
}
