import type { AsyncStorage, Evaluation, SyncStorage } from '../types'
import { getCache } from '../cache'

const sampleEvaluations: Evaluation[] = [
  { flag: 'flag1', value: 'false', kind: 'boolean', identifier: 'false' },
  { flag: 'flag2', value: 'true', kind: 'boolean', identifier: 'true' },
  { flag: 'flag3', value: 'false', kind: 'boolean', identifier: 'false' }
]

const sampleSyncStorage: SyncStorage = {
  getItem() {
    return null
  },
  setItem() {},
  removeItem() {}
}

const sampleAsyncStorage: AsyncStorage = {
  async getItem() {
    return null
  },
  async setItem() {},
  async removeItem() {}
}

describe('getCache', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe.each([
    ['sync', sampleSyncStorage],
    ['async', sampleAsyncStorage]
  ])('with %s storage', (_, storage) => {
    test('it should return evaluations stored in cache', async () => {
      jest.spyOn(storage, 'getItem').mockReturnValue(JSON.stringify(sampleEvaluations))
      const cache = await getCache('something', { storage })

      expect(await cache.loadFromCache()).toEqual(sampleEvaluations)
    })

    test('it should try to remove the existing cache if the ttl has expired', async () => {
      jest.spyOn(storage, 'getItem').mockImplementation(key => {
        if (key.endsWith('.ts')) {
          return (Date.now() - 100000).toString()
        }

        return JSON.stringify(sampleEvaluations)
      })
      const removeItemMock = jest.spyOn(storage, 'removeItem')

      const cache = await getCache('something', { storage, ttl: 1000 })

      expect(await cache.loadFromCache()).toEqual([])
      expect(removeItemMock).toHaveBeenCalledWith('HARNESS_FF_CACHE_c29tZXRoaW5n')
      expect(removeItemMock).toHaveBeenCalledWith('HARNESS_FF_CACHE_c29tZXRoaW5n.ts')
    })

    test('it should not try to remove the existing cache if the ttl has not expired', async () => {
      jest.spyOn(storage, 'getItem').mockImplementation(key => {
        if (key.endsWith('.ts')) {
          return Date.now().toString()
        }

        return JSON.stringify(sampleEvaluations)
      })
      const removeItemMock = jest.spyOn(storage, 'removeItem')

      const cache = await getCache('something', { storage, ttl: 1000 })

      expect(await cache.loadFromCache()).toEqual(sampleEvaluations)
      expect(removeItemMock).not.toHaveBeenCalled()
    })

    test('it should try to save evaluations to the cache', async () => {
      const setItemMock = jest.spyOn(storage, 'setItem')
      const cache = await getCache('something', { storage })

      await cache.saveToCache(sampleEvaluations)

      expect(setItemMock).toHaveBeenCalledWith('HARNESS_FF_CACHE_c29tZXRoaW5n', JSON.stringify(sampleEvaluations))
      expect(setItemMock).toHaveBeenCalledWith(
        'HARNESS_FF_CACHE_c29tZXRoaW5n.ts',
        expect.stringContaining(Date.now().toString().substring(0, 8))
      )
    })

    test('it should try to update a specific evaluation if it exists', async () => {
      jest.spyOn(storage, 'getItem').mockReturnValue(JSON.stringify(sampleEvaluations))
      const setItemMock = jest.spyOn(storage, 'setItem')

      const cache = await getCache('something', { storage })
      const newEvaluation = { flag: 'flag3', value: 'true', kind: 'boolean', identifier: 'true' }

      await cache.updateCachedEvaluation(newEvaluation)

      expect(setItemMock).toHaveBeenCalledWith(
        'HARNESS_FF_CACHE_c29tZXRoaW5n',
        expect.stringContaining(JSON.stringify(newEvaluation))
      )
      expect(setItemMock).toHaveBeenCalledWith(
        'HARNESS_FF_CACHE_c29tZXRoaW5n',
        expect.not.stringContaining(JSON.stringify(sampleEvaluations[2]))
      )
    })

    test('it should try to add new evaluation if it doesnt already exist', async () => {
      jest.spyOn(storage, 'getItem').mockReturnValue(JSON.stringify(sampleEvaluations))
      const setItemMock = jest.spyOn(storage, 'setItem')

      const cache = await getCache('something', { storage })
      const newEvaluation = { flag: 'flag4', value: 'true', kind: 'boolean', identifier: 'true' }

      await cache.updateCachedEvaluation(newEvaluation)

      expect(setItemMock).toHaveBeenCalledWith(
        'HARNESS_FF_CACHE_c29tZXRoaW5n',
        expect.stringContaining(JSON.stringify(newEvaluation))
      )
      expect(JSON.parse(setItemMock.mock.calls[0][1])).toHaveLength(sampleEvaluations.length + 1)
    })

    test('it should try to remove a specific evaluation if it exists', async () => {
      jest.spyOn(storage, 'getItem').mockReturnValue(JSON.stringify(sampleEvaluations))
      const setItemMock = jest.spyOn(storage, 'setItem')

      const cache = await getCache('something', { storage })
      const evaluationToDelete = sampleEvaluations[2]

      await cache.removeCachedEvaluation(evaluationToDelete.flag)

      expect(setItemMock).toHaveBeenCalledWith(
        'HARNESS_FF_CACHE_c29tZXRoaW5n',
        expect.not.stringContaining(JSON.stringify(evaluationToDelete))
      )
      expect(JSON.parse(setItemMock.mock.calls[0][1])).toHaveLength(sampleEvaluations.length - 1)
    })

    test('it should do nothing if the evaluation to remove does not exist', async () => {
      jest.spyOn(storage, 'getItem').mockReturnValue(JSON.stringify(sampleEvaluations))
      const setItemMock = jest.spyOn(storage, 'setItem')

      const cache = await getCache('something', { storage })
      const evaluationToDelete = { flag: 'flag4', value: 'true', kind: 'boolean', identifier: 'true' }

      await cache.removeCachedEvaluation(evaluationToDelete.flag)

      expect(setItemMock).not.toHaveBeenCalled()
    })
  })
})
