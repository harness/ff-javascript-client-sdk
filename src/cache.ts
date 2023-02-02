import type { Evaluation } from './types'

export function getCacheId(targetIdentifier: string): string {
  return 'HARNESS_FF_CACHE_' + targetIdentifier
}

export function loadFromCache(targetIdentifier: string): Evaluation[] {
  const cachedEvaluations = window.localStorage.getItem(getCacheId(targetIdentifier))

  if (cachedEvaluations) {
    try {
      return JSON.parse(cachedEvaluations)
    } catch (e) {}
  }

  return []
}

export function saveToCache(targetIdentifier: string, evaluations: Evaluation[]): void {
  window.localStorage.setItem(getCacheId(targetIdentifier), JSON.stringify(evaluations))
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
