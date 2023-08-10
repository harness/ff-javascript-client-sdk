import type { APIRequestMiddleware } from './types'

export function addMiddlewareToFetch(fn: APIRequestMiddleware): typeof fetch {
  return function fetchWithMiddleware(...args) {
    const [url, options] = fn(args)
    return fetch(url, options)
  }
}
