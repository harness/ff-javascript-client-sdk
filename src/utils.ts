import { Options } from './types'

export const MIN_EVENTS_SYNC_INTERVAL = 60000

export const defaultOptions: Options = {
  debug: false,
  baseUrl: 'https://config.ff.harness.io/api/1.0',
  eventUrl: 'https://events.ff.harness.io/api/1.0',
  eventsSyncInterval: MIN_EVENTS_SYNC_INTERVAL,
  streamEnabled: true,
  allAttributesPrivate: false,
  privateAttributeNames: [],
  cache: false
}

// tslint:disable-next-line:no-console
export const logError = (message: string, ...args: any[]) => console.error(`[FF-SDK] ${message}`, ...args)
