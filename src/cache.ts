import type { AsyncStorage, CacheOptions, Evaluation, SyncStorage, Target } from './types'

export interface GetCacheResponse {
  loadFromCache: () => Promise<Evaluation[]>
  saveToCache: (evaluations: Evaluation[]) => Promise<void>
  updateCachedEvaluation: (evaluation: Evaluation) => Promise<void>
  removeCachedEvaluation: (flagIdentifier: string) => Promise<void>
}

export async function getCache(seed: string, cacheOptions: CacheOptions = {}): Promise<GetCacheResponse> {
  const cacheId = await getCacheId(seed)
  const storage = getStorage(cacheOptions)

  return {
    loadFromCache: () => loadFromCache(cacheId, storage, cacheOptions),
    saveToCache: (evaluations: Evaluation[]) => saveToCache(cacheId, storage, evaluations),
    updateCachedEvaluation: (evaluation: Evaluation) => updateCachedEvaluation(cacheId, storage, evaluation),
    removeCachedEvaluation: (flagIdentifier: string) => removeCachedEvaluation(cacheId, storage, flagIdentifier)
  }
}

async function loadFromCache(
  cacheId: string,
  storage: AsyncStorage,
  cacheOptions: CacheOptions = {}
): Promise<Evaluation[]> {
  const timestamp = parseInt(await storage.getItem(cacheId + '.ts'))

  if (cacheOptions?.ttl && !isNaN(timestamp) && timestamp + cacheOptions.ttl < Date.now()) {
    await clearCachedEvaluations(cacheId, storage)
    return []
  }

  const cachedEvaluations = await storage.getItem(cacheId)

  if (cachedEvaluations) {
    try {
      return JSON.parse(cachedEvaluations)
    } catch (e) {}
  }

  return []
}

async function clearCachedEvaluations(cacheId: string, storage: AsyncStorage): Promise<void> {
  await storage.removeItem(cacheId)
  await storage.removeItem(cacheId + '.ts')
}

async function saveToCache(cacheId: string, storage: AsyncStorage, evaluations: Evaluation[]): Promise<void> {
  await storage.setItem(cacheId, JSON.stringify(evaluations))
  await storage.setItem(cacheId + '.ts', Date.now().toString())
}

async function updateCachedEvaluation(cacheId: string, storage: AsyncStorage, evaluation: Evaluation): Promise<void> {
  const cachedEvals = await loadFromCache(cacheId, storage)
  const existingEval = cachedEvals.find(({ flag }) => flag === evaluation.flag)

  if (existingEval) {
    Object.assign(existingEval, evaluation)
  } else {
    cachedEvals.push(evaluation)
  }

  await saveToCache(cacheId, storage, cachedEvals)
}

async function removeCachedEvaluation(cacheId: string, storage: AsyncStorage, flagIdentifier: string): Promise<void> {
  const cachedEvals = await loadFromCache(cacheId, storage)
  const existingEvalIndex = cachedEvals.findIndex(({ flag }) => flag === flagIdentifier)

  if (existingEvalIndex > -1) {
    cachedEvals.splice(existingEvalIndex, 1)

    await saveToCache(cacheId, storage, cachedEvals)
  }
}

export function createCacheIdSeed(target: Target, apiKey: string, config: CacheOptions = {}) {
  if (!config.deriveKeyFromTargetAttributes) return target.identifier + apiKey

  return (
    JSON.stringify(
      Object.keys(target.attributes || {})
        .sort()
        .filter(
          attribute =>
            !Array.isArray(config.deriveKeyFromTargetAttributes) ||
            config.deriveKeyFromTargetAttributes.includes(attribute)
        )
        .reduce(
          (filteredAttributes, attribute) => ({ ...filteredAttributes, [attribute]: target.attributes[attribute] }),
          {}
        )
    ) +
    target.identifier +
    apiKey
  )
}

async function getCacheId(seed: string): Promise<string> {
  let cacheId = seed

  if (globalThis?.TextEncoder && globalThis?.crypto?.subtle?.digest) {
    const encoder = new TextEncoder()
    const data = encoder.encode(seed)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    cacheId = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } else if (globalThis.btoa) {
    cacheId = btoa(seed)
  }

  return 'HARNESS_FF_CACHE_' + cacheId
}

function getStorage(cacheOptions: CacheOptions): AsyncStorage {
  let storageOption: AsyncStorage | SyncStorage

  if (
    !cacheOptions.storage ||
    typeof cacheOptions.storage !== 'object' ||
    !('getItem' in cacheOptions.storage) ||
    !('setItem' in cacheOptions.storage) ||
    !('removeItem' in cacheOptions.storage)
  ) {
    if (globalThis.localStorage) {
      storageOption = globalThis.localStorage
    } else if (globalThis.sessionStorage) {
      storageOption = globalThis.sessionStorage
    } else {
      storageOption = NullStorage
    }
  } else {
    storageOption = cacheOptions.storage
  }

  return {
    async getItem(key: string) {
      const result = storageOption.getItem(key)
      return result instanceof Promise ? await result : result
    },
    async setItem(key: string, value: string) {
      const result = storageOption.setItem(key, value)
      if (result instanceof Promise) await result
    },
    async removeItem(key: string) {
      const result = storageOption.removeItem(key)
      if (result instanceof Promise) await result
    }
  }
}

const NullStorage: SyncStorage = {
  getItem: () => null,
  setItem: () => void 0,
  removeItem: () => void 0
}
