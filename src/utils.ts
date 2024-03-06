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
  cache: false
}

export const getConfiguration = (options: Options): Options => {
  const config = { ...defaultOptions, ...options }

  if (config.pollingEnabled === undefined) {
    config.pollingEnabled = config.streamEnabled
  }

  if (config.eventsSyncInterval < MIN_EVENTS_SYNC_INTERVAL) {
    config.eventsSyncInterval = MIN_EVENTS_SYNC_INTERVAL
  }

  if (config.pollingInterval < MIN_POLLING_INTERVAL) {
    config.pollingInterval = MIN_POLLING_INTERVAL
  }

  if (!config.logger || !config.logger.debug || !config.logger.error || !config.logger.info || !config.logger.warn) {
    config.logger = console
  }

  return config
}

export const defer = (fn: Function, doDefer = true): void => {
  if (doDefer) {
    setTimeout(fn, 0)
  } else {
    fn()
  }
}

export const getRandom = (min: number, max: number): number => {
  return Math.round(Math.random() * (max - min) + min)
}
