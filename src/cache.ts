import type { CacheOptions, Evaluation } from './types'

export async function getCacheId(seed: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(seed)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const cacheId = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return 'HARNESS_FF_CACHE_' + cacheId
}

export function loadFromCache(cacheId: string, cacheOptions: CacheOptions = {}): Evaluation[] {
  const timestamp = parseInt(window.localStorage.getItem(cacheId + '.ts'))

  if (cacheOptions?.ttl && !isNaN(timestamp) && timestamp + cacheOptions.ttl < Date.now()) {
    clearCachedEvaluations(cacheId)
    return []
  }

  const cachedEvaluations = window.localStorage.getItem(cacheId)

  if (cachedEvaluations) {
    try {
      return JSON.parse(cachedEvaluations)
    } catch (e) {}
  }

  return []
}

export function saveToCache(cacheId: string, evaluations: Evaluation[]): void {
  window.localStorage.setItem(cacheId, JSON.stringify(evaluations))
  window.localStorage.setItem(cacheId + '.ts', Date.now().toString())
}

export function updateCachedEvaluation(cacheId: string, evaluation: Evaluation): void {
  const cachedEvals = loadFromCache(cacheId)
  const existingEval = cachedEvals.find(({ flag }) => flag === evaluation.flag)

  if (existingEval) {
    Object.assign(existingEval, evaluation)
  } else {
    cachedEvals.push(evaluation)
  }

  saveToCache(cacheId, cachedEvals)
}

export function removeCachedEvaluation(cacheId: string, flagIdentifier: string): void {
  const cachedEvals = loadFromCache(cacheId)
  const existingEvalIndex = cachedEvals.findIndex(({ flag }) => flag === flagIdentifier)

  if (existingEvalIndex > -1) {
    cachedEvals.splice(existingEvalIndex, 1)

    saveToCache(cacheId, cachedEvals)
  }
}

export function clearCachedEvaluations(cacheId: string): void {
  window.localStorage.removeItem(cacheId)
  window.localStorage.removeItem(cacheId + '.ts')
}
