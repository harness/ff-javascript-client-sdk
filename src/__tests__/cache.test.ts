import {
  clearCachedEvaluations,
  getCacheId,
  loadFromCache,
  removeCachedEvaluation,
  saveToCache,
  updateCachedEvaluation
} from '../cache'
import type { Evaluation } from '../types'
import { TextEncoder, TextDecoder } from 'util'
import crypto from 'crypto'

Object.defineProperty(global.self, 'crypto', {
  value: {
    subtle: crypto.webcrypto.subtle
  }
})
Object.assign(global, { TextDecoder, TextEncoder })

describe('Cache', () => {
  const cacheId = 'some-cache-id'

  function primeCache(): Evaluation[] {
    const evals = [
      {
        flag: 'F1',
        deleted: false,
        value: 'true',
        identifier: 'true',
        kind: 'boolean'
      }
    ]

    window.localStorage.setItem(cacheId, JSON.stringify(evals))

    return evals
  }

  beforeEach(() => {
    window.localStorage.clear()
  })

  describe('getCacheId', () => {
    test('it should prefix the target ID', async () => {
      expect(await getCacheId('yatta')).toBe(
        'HARNESS_FF_CACHE_248ad761f624bc5b0aed163c1d1585f562b4c058616a41f1919d00f669adbf1c'
      )
    })
  })

  describe('loadFromCache', () => {
    test('it should return an empty array if nothing is stored', async () => {
      expect(loadFromCache(cacheId)).toEqual([])
    })

    test('it should return the evaluations that were set', async () => {
      const evals = primeCache()

      expect(loadFromCache(cacheId)).toEqual(evals)
    })

    test('it should return an empty array if the stored evaluations are malformed', async () => {
      window.localStorage.setItem(cacheId, 'abc123]{.')

      expect(loadFromCache(cacheId)).toEqual([])
    })

    test('it should return an empty array if the stored evaluations timestamp exceeds the ttl', async () => {
      primeCache()
      window.localStorage.setItem(cacheId + '.ts', '0')

      expect(loadFromCache(cacheId, { ttl: 60000 })).toEqual([])
    })

    test('it should return the evaluations if the stored evaluations timestamp does not exceed the ttl', async () => {
      const evals = primeCache()
      window.localStorage.setItem(cacheId + '.ts', Date.now().toString())

      expect(loadFromCache(cacheId, { ttl: 60000 })).toEqual(evals)
    })
  })

  describe('saveToCache', () => {
    test('it should persist the passed evaluations', async () => {
      expect(window.localStorage.getItem(cacheId)).toBeFalsy()

      const evals: Evaluation[] = [{ flag: 'F1', deleted: false, value: 'true', identifier: 'true', kind: 'boolean' }]
      saveToCache(cacheId, evals)

      expect(window.localStorage.getItem(cacheId)).toBeTruthy()
    })

    test('it should save the timestamp of when the evaluations were stored', async () => {
      const now = Date.now()
      saveToCache(cacheId, [{ flag: 'F1', deleted: false, value: 'true', identifier: 'true', kind: 'boolean' }])

      const timestamp = parseInt(window.localStorage.getItem(cacheId + '.ts'))
      expect(timestamp / 1000).toBeCloseTo(now / 1000, 0)
    })
  })

  describe('updateCachedEvaluation', () => {
    test('it should update an existing evaluation ', async () => {
      const evals = primeCache()

      const updatedEval = { ...evals[0], value: 'false', identifier: 'false' }
      updateCachedEvaluation(cacheId, updatedEval)

      expect(JSON.parse(window.localStorage.getItem(cacheId) as string)).toContainEqual(updatedEval)
    })

    test('it should append a new evaluation ', async () => {
      const evals = primeCache()

      const newEval = { flag: 'F2', deleted: false, value: 'false', identifier: 'false', kind: 'boolean' }
      updateCachedEvaluation(cacheId, newEval)

      const storedEvals = JSON.parse(window.localStorage.getItem(cacheId) as string)
      expect(storedEvals).toHaveLength(evals.length + 1)
      expect(storedEvals).toContainEqual(newEval)
    })
  })

  describe('removeCachedEvaluation', () => {
    test('it should remove an existing cached item', async () => {
      const evals = primeCache()

      removeCachedEvaluation(cacheId, evals[0].flag)

      const storedEvals = JSON.parse(window.localStorage.getItem(cacheId) as string)
      expect(storedEvals).toHaveLength(evals.length - 1)
      expect(storedEvals).not.toContainEqual(evals[0])
    })
  })

  describe('clearCachedEvaluations', () => {
    test('it should clear stored evaluations and timestamp', async () => {
      primeCache()
      window.localStorage.setItem(cacheId + '.ts', Date.now().toString())

      expect(window.localStorage.getItem(cacheId)).toBeTruthy()
      expect(window.localStorage.getItem(cacheId + '.ts')).toBeTruthy()

      clearCachedEvaluations(cacheId)

      expect(window.localStorage.getItem(cacheId)).toBeFalsy()
      expect(window.localStorage.getItem(cacheId + '.ts')).toBeFalsy()
    })
  })
})
