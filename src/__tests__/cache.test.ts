import {
  clearCachedEvaluations,
  getCacheId,
  loadFromCache,
  removeCachedEvaluation,
  saveToCache,
  updateCachedEvaluation
} from '../cache'
import type { Evaluation } from '../types'

describe('Cache', () => {
  const targetIdentifier = 'TEST_123'

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

    window.localStorage.setItem(getCacheId(targetIdentifier), JSON.stringify(evals))

    return evals
  }

  beforeEach(() => {
    window.localStorage.clear()
  })

  describe('getCacheId', () => {
    test('it should prefix the target ID', async () => {
      expect(getCacheId(targetIdentifier)).toBe('HARNESS_FF_CACHE_' + targetIdentifier)
    })
  })

  describe('loadFromCache', () => {
    test('it should return an empty array if nothing is stored', async () => {
      expect(loadFromCache(targetIdentifier)).toEqual([])
    })

    test('it should return the evaluations that were set', async () => {
      const evals = primeCache()

      expect(loadFromCache(targetIdentifier)).toEqual(evals)
    })

    test('it should return an empty array if the stored evaluations are malformed', async () => {
      window.localStorage.setItem(getCacheId(targetIdentifier), 'abc123]{.')

      expect(loadFromCache(targetIdentifier)).toEqual([])
    })

    test('it should return an empty array if the stored evaluations timestamp exceeds the ttl', async () => {
      primeCache()
      window.localStorage.setItem(getCacheId(targetIdentifier) + '.ts', '0')

      expect(loadFromCache(targetIdentifier, { ttl: 60000 })).toEqual([])
    })

    test('it should return the evaluations if the stored evaluations timestamp does not exceed the ttl', async () => {
      const evals = primeCache()
      window.localStorage.setItem(getCacheId(targetIdentifier) + '.ts', Date.now().toString())

      expect(loadFromCache(targetIdentifier, { ttl: 60000 })).toEqual(evals)
    })
  })

  describe('saveToCache', () => {
    test('it should persist the passed evaluations', async () => {
      expect(window.localStorage.getItem(getCacheId(targetIdentifier))).toBeFalsy()

      const evals: Evaluation[] = [{ flag: 'F1', deleted: false, value: 'true', identifier: 'true', kind: 'boolean' }]
      saveToCache(targetIdentifier, evals)

      expect(window.localStorage.getItem(getCacheId(targetIdentifier))).toBeTruthy()
    })

    test('it should save the timestamp of when the evaluations were stored', async () => {
      const now = Date.now()
      saveToCache(targetIdentifier, [
        { flag: 'F1', deleted: false, value: 'true', identifier: 'true', kind: 'boolean' }
      ])

      const timestamp = parseInt(window.localStorage.getItem(getCacheId(targetIdentifier) + '.ts'))
      expect(timestamp / 1000).toBeCloseTo(now / 1000, 0)
    })
  })

  describe('updateCachedEvaluation', () => {
    test('it should update an existing evaluation ', async () => {
      const evals = primeCache()

      const updatedEval = { ...evals[0], value: 'false', identifier: 'false' }
      updateCachedEvaluation(targetIdentifier, updatedEval)

      expect(JSON.parse(window.localStorage.getItem(getCacheId(targetIdentifier)) as string)).toContainEqual(
        updatedEval
      )
    })

    test('it should append a new evaluation ', async () => {
      const evals = primeCache()

      const newEval = { flag: 'F2', deleted: false, value: 'false', identifier: 'false', kind: 'boolean' }
      updateCachedEvaluation(targetIdentifier, newEval)

      const storedEvals = JSON.parse(window.localStorage.getItem(getCacheId(targetIdentifier)) as string)
      expect(storedEvals).toHaveLength(evals.length + 1)
      expect(storedEvals).toContainEqual(newEval)
    })
  })

  describe('removeCachedEvaluation', () => {
    test('it should remove an existing cached item', async () => {
      const evals = primeCache()

      removeCachedEvaluation(targetIdentifier, evals[0].flag)

      const storedEvals = JSON.parse(window.localStorage.getItem(getCacheId(targetIdentifier)) as string)
      expect(storedEvals).toHaveLength(evals.length - 1)
      expect(storedEvals).not.toContainEqual(evals[0])
    })
  })

  describe('clearCachedEvaluations', () => {
    test('it should clear stored evaluations and timestamp', async () => {
      primeCache()
      window.localStorage.setItem(getCacheId(targetIdentifier) + '.ts', Date.now().toString())

      expect(window.localStorage.getItem(getCacheId(targetIdentifier))).toBeTruthy()
      expect(window.localStorage.getItem(getCacheId(targetIdentifier) + '.ts')).toBeTruthy()

      clearCachedEvaluations(targetIdentifier)

      expect(window.localStorage.getItem(getCacheId(targetIdentifier))).toBeFalsy()
      expect(window.localStorage.getItem(getCacheId(targetIdentifier) + '.ts')).toBeFalsy()
    })
  })
})
