import type { APIRequestMiddleware } from './types'
import { EventSourcePolyfill } from 'event-source-polyfill'

export function addMiddlewareToFetch(fn: APIRequestMiddleware): typeof fetch {
  return function fetchWithMiddleware(...args) {
    const [url, options] = fn(args)
    return fetch(url, options)
  }
}

export function addMiddlewareToEventSource(fn): typeof EventSourcePolyfill {
  return function eventSourceWithMiddleware(...args) {
    const [url, options] = fn(args)
    return new EventSourcePolyfill(url, options)
  }
}
