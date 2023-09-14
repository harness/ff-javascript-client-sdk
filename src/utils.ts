import type { Options } from './types'

export const MIN_EVENTS_SYNC_INTERVAL = 60000
export const MIN_POLLING_INTERVAL = 60000

export const defaultOptions: Options = {
  debug: false,
  baseUrl: 'https://config.ff.harness.io/api/1.0',
  eventUrl: 'https://events.ff.harness.io/api/1.0',
  eventsSyncInterval: MIN_EVENTS_SYNC_INTERVAL,
  pollingInterval: MIN_POLLING_INTERVAL,
  streamEnabled: true,
  pollingEnabled: false,
  allAttributesPrivate: false,
  privateAttributeNames: [],
  cache: false
}

// tslint:disable-next-line:no-console
export const logError = (message: string, ...args: any[]) => console.error(`[FF-SDK] ${message}`, ...args)

export const defer = (fn: Function, doDefer = true): void => {
  if (doDefer) {
    setTimeout(fn, 0)
  } else {
    fn()
  }
}

export const getRandom = (min, max) => {
  return Math.round(Math.random() * (max - min) + min)
}
