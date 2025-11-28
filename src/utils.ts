import type { Evaluation, Options, Target } from './types'

export const MIN_EVENTS_SYNC_INTERVAL = 60000
export const MIN_POLLING_INTERVAL = 60000

export const defaultOptions: Options = {
  debug: false,
  baseUrl: 'https://config.ff.harness.io/api/1.0',
  eventUrl: 'https://events.ff.harness.io/api/1.0',
  eventsSyncInterval: MIN_EVENTS_SYNC_INTERVAL,
  pollingInterval: MIN_POLLING_INTERVAL,
  enableAnalytics: true,
  streamEnabled: true,
  cache: false,
  authRequestReadTimeout: 0,
  maxStreamRetries: Infinity
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

export const encodeTarget = (target: Target): string => {
  const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

  let output = ''
  let pos = 0

  const input = utf8encode(JSON.stringify(target))

  while (pos < input.length) {
    const chr1 = input.charCodeAt(pos++)
    const chr2 = input.charCodeAt(pos++)
    const chr3 = input.charCodeAt(pos++)

    const enc1 = chr1 >> 2
    const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
    let enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
    let enc4 = chr3 & 63

    if (isNaN(chr2)) {
      enc3 = enc4 = 64
    } else if (isNaN(chr3)) {
      enc4 = 64
    }

    output += keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4)
  }

  return output
}

const utf8encode = (str: string): string =>
  str
    .replace(/\r\n/g, '\n')
    .split('')
    .map(char => {
      const charCode = char.charCodeAt(0)

      if (charCode < 128) {
        return String.fromCharCode(charCode)
      } else if (charCode > 127 && charCode < 2048) {
        return String.fromCharCode((charCode >> 6) | 192) + String.fromCharCode((charCode & 63) | 128)
      }

      return (
        String.fromCharCode((charCode >> 12) | 224) +
        String.fromCharCode(((charCode >> 6) & 63) | 128) +
        String.fromCharCode((charCode & 63) | 128)
      )
    })
    .join('')

export function sortEvaluations(evaluations: Evaluation[]): Evaluation[] {
  return [...evaluations].sort(({ flag: flagA }, { flag: flagB }) => (flagA < flagB ? -1 : 1))
}
