import type { CacheOptions, Evaluation } from './types'

export function getCacheId(targetIdentifier: string): string {
  return 'HARNESS_FF_CACHE_' + targetIdentifier
}

export function loadFromCache(targetIdentifier: string, cacheOptions: CacheOptions = {}): Evaluation[] {
  const cacheId = getCacheId(targetIdentifier)
  const timestamp = parseInt(window.localStorage.getItem(cacheId + '.ts'))

  if (cacheOptions?.ttl && !isNaN(timestamp) && timestamp + cacheOptions.ttl < Date.now()) {
    clearCachedEvaluations(targetIdentifier)
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

export function saveToCache(targetIdentifier: string, evaluations: Evaluation[]): void {
  const cacheId = getCacheId(targetIdentifier)
  window.localStorage.setItem(cacheId, JSON.stringify(evaluations))
  window.localStorage.setItem(cacheId + '.ts', Date.now().toString())
}

export function updateCachedEvaluation(targetIdentifier: string, evaluation: Evaluation): void {
  const cachedEvals = loadFromCache(targetIdentifier)
  const existingEval = cachedEvals.find(({ flag }) => flag === evaluation.flag)

  if (existingEval) {
    Object.assign(existingEval, evaluation)
  } else {
    cachedEvals.push(evaluation)
  }

  saveToCache(targetIdentifier, cachedEvals)
}

export function removeCachedEvaluation(targetIdentifier: string, flagIdentifier: string): void {
  const cachedEvals = loadFromCache(targetIdentifier)
  const existingEvalIndex = cachedEvals.findIndex(({ flag }) => flag === flagIdentifier)

  if (existingEvalIndex > -1) {
    cachedEvals.splice(existingEvalIndex, 1)

    saveToCache(targetIdentifier, cachedEvals)
  }
}

export function clearCachedEvaluations(targetIdentifier: string): void {
  const cacheId = getCacheId(targetIdentifier)
  window.localStorage.removeItem(cacheId)
  window.localStorage.removeItem(cacheId + '.ts')
}
