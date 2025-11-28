import jwt_decode from 'jwt-decode'
import mitt, { EventType, WildcardHandler } from 'mitt'
import type {
  APIRequestMiddleware,
  Evaluation,
  EventOffBinding,
  EventOnBinding,
  FetchFlagsResult,
  MetricsInfo,
  Options,
  Result,
  StreamEvent,
  Target,
  VariationFn,
  VariationValue,
  DefaultVariationEventPayload
} from './types'
import { Event } from './types'
import { defer, encodeTarget, getConfiguration, sortEvaluations } from './utils'
import { addMiddlewareToFetch } from './request'
import { Streamer } from './stream'
import { getVariation } from './variation'
import Poller from './poller'
import { createCacheIdSeed, getCache } from './cache'

const SDK_VERSION = '1.31.3'
const SDK_INFO = `Javascript ${SDK_VERSION} Client`
const METRICS_VALID_COUNT_INTERVAL = 500

// Flag to detect is Proxy is supported (not under IE 11)
const hasProxy = !!globalThis.Proxy

const initialize = (apiKey: string, target: Target, options?: Options): Result => {
  let closed = false
  let environment: string
  let clusterIdentifier: string
  let eventSource: Streamer | undefined
  let poller: Poller
  let jwtToken: string
  let metricsSchedulerId: number
  let standardHeaders: Record<string, string> = {}
  let defaultMiddleware: APIRequestMiddleware = args => args
  let fetchWithMiddleware = addMiddlewareToFetch(defaultMiddleware)
  let lastCacheRefreshTime = 0
  let initialised = false
  // We need to pause metrics in certain situations, such as when we are doing the initial evaluation load, and when
  // setEvaluations() is used to manually inject evaluations.
  let metricsCollectorPaused = false
  let metrics: MetricsInfo[] = []

  const configurations = getConfiguration(options)
  const enableAnalytics = configurations.enableAnalytics
  const eventBus = mitt()

  const stopMetricsCollector = () => {
    metricsCollectorPaused = true
  }
  const startMetricsCollector = () => {
    metricsCollectorPaused = false
  }

  const canCollectMetrics = (): boolean => {
    return enableAnalytics && !metricsCollectorPaused
  }

  const logDebug = (message: string, ...args: any[]) => {
    if (configurations.debug) {
      configurations.logger.debug(`[FF-SDK] ${message}`, ...args)
    }
  }

  const logError = (message: string, ...args: any[]) => {
    configurations.logger.error(`[FF-SDK] ${message}`, ...args)
  }

  const logWarn = (message: string, ...args: any[]) => {
    configurations.logger.warn(`[FF-SDK] ${message}`, ...args)
  }

  const convertValue = (evaluation: Evaluation) => {
    let { value } = evaluation

    try {
      switch (evaluation.kind.toLowerCase()) {
        case 'int':
        case 'number':
          value = Number(value)
          break
        case 'boolean':
          value = value.toString().toLowerCase() === 'true'
          break
        case 'json':
          value = JSON.parse(value as string)
          break
      }
    } catch (error) {
      logError(error)
    }

    return value
  }

  const updateMetrics = (metricsInfo: MetricsInfo) => {
    if (canCollectMetrics()) {
      const now = Date.now()

      if (now - metricsInfo.lastAccessed > METRICS_VALID_COUNT_INTERVAL) {
        metricsInfo.count++
        metricsInfo.lastAccessed = now
      }
    }
  }

  const initCache = async () => {
    if (configurations.cache) {
      logDebug('initializing cache')

      try {
        let initialLoad = true

        const cacheConfig = typeof configurations.cache === 'boolean' ? {} : configurations.cache

        const cache = await getCache(createCacheIdSeed(target, apiKey, cacheConfig), cacheConfig)

        const cachedEvaluations = await cache.loadFromCache()

        if (!!cachedEvaluations?.length) {
          defer(() => {
            logDebug('loading from cache', cachedEvaluations)
            setEvaluations(cachedEvaluations, false)
            eventBus.emit(Event.CACHE_LOADED, cachedEvaluations)
          })
        }

        on(Event.FLAGS_LOADED, async evaluations => {
          await cache.saveToCache(evaluations)
          initialLoad = false
        })

        on(Event.CHANGED, async evaluation => {
          if (!initialLoad) {
            if (evaluation.deleted) {
              await cache.removeCachedEvaluation(evaluation.flag)
            } else {
              await cache.updateCachedEvaluation(evaluation)
            }
          }
        })
      } catch (error) {
        logError('Cache error: ', error)
        eventBus.emit(Event.ERROR_CACHE, error)
        eventBus.emit(Event.ERROR, error)
      }
    }
  }

  const authenticate = async (clientID: string, configuration: Options): Promise<string> => {
    const url = `${configuration.baseUrl}/client/auth`
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Harness-SDK-Info': SDK_INFO },
      body: JSON.stringify({
        apiKey: clientID,
        target: { ...target, identifier: String(target.identifier) }
      })
    }

    let timeoutId: number | undefined
    let abortController: AbortController | undefined

    if (window.AbortController && configurations.authRequestReadTimeout > 0) {
      abortController = new AbortController()
      requestOptions.signal = abortController.signal

      timeoutId = window.setTimeout(() => abortController.abort(), configuration.authRequestReadTimeout)
    } else if (configuration.authRequestReadTimeout > 0) {
      logWarn('AbortController is not available, auth request will not timeout')
    }

    try {
      const response = await fetchWithMiddleware(url, requestOptions)

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`)
      }

      const data: { authToken: string } = await response.json()
      return data.authToken
    } catch (error) {
      if (abortController && abortController.signal.aborted) {
        throw new Error(
          `Request to ${url} failed: Request timeout via configured authRequestTimeout of ${configurations.authRequestReadTimeout}`
        )
      }
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`Request to ${url} failed: ${errorMessage}`)
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }

  let failedMetricsCallCount = 0

  const scheduleSendingMetrics = () => {
    if (!canCollectMetrics()) {
      return
    }

    if (metrics.length) {
      logDebug('Sending metrics...', { metrics, evaluations })
      const payload = {
        metricsData: metrics.map(entry => ({
          timestamp: Date.now(),
          count: entry.count,
          metricsType: 'FFMETRICS',
          attributes: [
            {
              key: 'featureIdentifier',
              value: entry.featureIdentifier
            },
            {
              key: 'featureName',
              value: entry.featureIdentifier
            },
            {
              key: 'variationIdentifier',
              value: entry.variationIdentifier
            },
            {
              key: 'target',
              value: target.identifier
            },
            {
              key: 'SDK_NAME',
              value: 'JavaScript'
            },
            {
              key: 'SDK_LANGUAGE',
              value: 'JavaScript'
            },
            {
              key: 'SDK_TYPE',
              value: 'client'
            },
            {
              key: 'SDK_VERSION',
              value: SDK_VERSION
            }
          ]
        }))
      }

      fetchWithMiddleware(`${configurations.eventUrl}/metrics/${environment}?cluster=${clusterIdentifier}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...standardHeaders },
        body: JSON.stringify(payload)
      })
        .then(() => {
          metrics = []
          failedMetricsCallCount = 0
        })
        .catch(error => {
          if (failedMetricsCallCount++) {
            metrics = []
            failedMetricsCallCount = 0
          }
          logDebug(error)
          eventBus.emit(Event.ERROR_METRICS, error)
        })
        .finally(() => {
          metricsSchedulerId = window.setTimeout(scheduleSendingMetrics, configurations.eventsSyncInterval)
        })
    } else {
      metricsSchedulerId = window.setTimeout(scheduleSendingMetrics, configurations.eventsSyncInterval)
    }
  }

  let evaluations: Record<string, Evaluation> = {}

  const sendEvent = (evaluation: Evaluation) => {
    logDebug('Sending event for', evaluation.flag)

    if (hasProxy) {
      eventBus.emit(
        Event.CHANGED,
        new Proxy(evaluation, {
          get(_flagInfo, property) {
            if (canCollectMetrics() && _flagInfo.hasOwnProperty(property) && property === 'value') {
              // only track metric when value is read
              const featureIdentifier = _flagInfo.flag
              const featureValue = evaluation.value
              const entry = metrics.find(
                _entry => _entry.featureIdentifier === featureIdentifier && _entry.featureValue === featureValue
              )

              if (entry) {
                updateMetrics(entry)
                entry.variationIdentifier = evaluations[featureIdentifier]?.identifier || ''
              } else {
                metrics.push({
                  featureIdentifier,
                  featureValue: String(featureValue),
                  variationIdentifier: evaluations[featureIdentifier].identifier || '',
                  count: 1,
                  lastAccessed: Date.now()
                })
              }
              logDebug('Metrics event: Flag', property, 'has been read with value via stream update', featureValue)
            }

            return property === 'value' ? convertValue(evaluation) : evaluation[property]
          }
        })
      )
    } else {
      eventBus.emit(Event.CHANGED, {
        deleted: evaluation.deleted,
        flag: evaluation.flag,
        value: convertValue(evaluation)
      })
    }
  }

  const createStorage = function () {
    return hasProxy
      ? new Proxy(
          {},
          {
            get(_storage, property) {
              const _value = _storage[property]

              if (canCollectMetrics() && _storage.hasOwnProperty(property)) {
                const featureValue = _storage[property]
                // TODO/BUG: This logic to collect metrics will fail when two variations have the same value
                // Need to find a better way
                const entry = metrics.find(
                  _entry => _entry.featureIdentifier === property && featureValue === _entry.featureValue
                )

                if (entry) {
                  entry.variationIdentifier = evaluations[property as string]?.identifier || ''
                  updateMetrics(entry)
                } else {
                  metrics.push({
                    featureIdentifier: property as string,
                    featureValue,
                    variationIdentifier: evaluations[property as string]?.identifier || '',
                    count: 1,
                    lastAccessed: Date.now()
                  })
                }
                logDebug(
                  'Metrics event: Flag:',
                  property,
                  'has been read with value:',
                  featureValue,
                  'variationIdentifier:',
                  evaluations[property as string]?.identifier
                )
              }

              return _value
            }
          }
        )
      : {}
  }

  let storage: Record<string, any> = createStorage()

  initCache().then(() =>
    authenticate(apiKey, configurations)
      .then(async (token: string) => {
        if (closed) return

        jwtToken = token
        const decoded: {
          environment: string
          environmentIdentifier: string
          clusterIdentifier: string
          accountID: string
        } = jwt_decode(token)

        standardHeaders = {
          Authorization: `Bearer ${jwtToken}`,
          'Harness-AccountID': decoded.accountID,
          'Harness-EnvironmentID': decoded.environmentIdentifier,
          'Harness-SDK-Info': SDK_INFO
        }

        const targetHeader = encodeTarget(target)

        // ensure encoded target is less than 1/4 of 1 MB
        if (targetHeader.length < 262144) {
          standardHeaders['Harness-Target'] = targetHeader
        }

        logDebug('Authenticated', decoded)

        if (canCollectMetrics()) {
          metricsSchedulerId = window.setTimeout(scheduleSendingMetrics, configurations.eventsSyncInterval)
        }

        environment = decoded.environment
        clusterIdentifier = decoded.clusterIdentifier

        const hasExistingFlags = !!Object.keys(evaluations).length

        // When authentication is done, fetch all flags
        const fetchFlagsResult = await fetchFlags()

        if (fetchFlagsResult.type === 'success') {
          logDebug('Fetch all flags ok', storage)
        }

        if (closed) return

        // Start stream or polling only after we get all evaluations
        if (configurations.streamEnabled) {
          logDebug('Streaming mode enabled')
          startStream()
        } else if (configurations.pollingEnabled) {
          logDebug('Polling mode enabled')
          startPolling()
        } else {
          logDebug('Streaming and polling mode disabled')
        }

        // Emit the ready event only if flags weren't already set using setEvaluations
        if (!hasExistingFlags) {
          stopMetricsCollector()
          const allFlags = { ...storage }
          startMetricsCollector()
          eventBus.emit(Event.READY, allFlags)
        }
        initialised = true
      })
      .catch(error => {
        logError('Authentication error: ', error)
        eventBus.emit(Event.ERROR_AUTH, error)
        eventBus.emit(Event.ERROR, error)
      })
  )

  const fetchFlags = async (): Promise<FetchFlagsResult> => {
    try {
      const res = await fetchWithMiddleware(
        `${configurations.baseUrl}/client/env/${environment}/target/${target.identifier}/evaluations?cluster=${clusterIdentifier}`,
        {
          headers: standardHeaders
        }
      )

      if (res.ok) {
        const data = sortEvaluations(await res.json())
        data.forEach(registerEvaluation)
        eventBus.emit(Event.FLAGS_LOADED, data)
        return { type: 'success', data: data }
      } else {
        logError('Features fetch operation error: ', res)
        eventBus.emit(Event.ERROR_FETCH_FLAGS, res)
        eventBus.emit(Event.ERROR, res)
        return { type: 'error', error: res }
      }
    } catch (error) {
      logError('Features fetch operation error: ', error)
      eventBus.emit(Event.ERROR_FETCH_FLAGS, error)
      eventBus.emit(Event.ERROR, error)
      return { type: 'error', error: error }
    }
  }

  const fetchFlag = async (identifier: string) => {
    try {
      const result = await fetchWithMiddleware(
        `${configurations.baseUrl}/client/env/${environment}/target/${target.identifier}/evaluations/${identifier}?cluster=${clusterIdentifier}`,
        {
          headers: standardHeaders
        }
      )

      if (result.ok) {
        const flagInfo: Evaluation = await result.json()

        registerEvaluation(flagInfo)
      } else {
        logError('Feature fetch operation error: ', result)
        eventBus.emit(Event.ERROR_FETCH_FLAG, result)
        eventBus.emit(Event.ERROR, result)
      }
    } catch (error) {
      logError('Feature fetch operation error: ', error)
      eventBus.emit(Event.ERROR_FETCH_FLAG, error)
      eventBus.emit(Event.ERROR, error)
    }
  }

  const registerEvaluation = (evaluation: Evaluation) => {
    stopMetricsCollector()
    const value = convertValue(evaluation)

    // Update the flag if the values are different
    if (value !== storage[evaluation.flag]) {
      logDebug('Flag variation has changed for ', evaluation.identifier)
      storage[evaluation.flag] = value
      evaluations[evaluation.flag] = { ...evaluation, value }
      sendEvent(evaluation)
    }
    startMetricsCollector()
  }

  // We instantiate the Poller here so it can be used as a fallback for streaming, but we don't start it yet.
  poller = new Poller(fetchFlags, configurations, eventBus, logDebug, logError)

  const startStream = () => {
    const handleFlagEvent = (event: StreamEvent): void => {
      switch (event.event) {
        case 'create':
          // if evaluation was sent in stream save it directly, else query for it
          if (areEvaluationsValid(event.evaluations)) {
            event.evaluations.forEach(evaluation => {
              registerEvaluation(evaluation)
            })
          } else {
            setTimeout(() => fetchFlag(event.identifier), 1000) // Wait a bit before fetching evaluation due to https://harness.atlassian.net/browse/FFM-583
          }

          break
        case 'patch':
          // if evaluation was sent in stream save it directly, else query for it
          if (areEvaluationsValid(event.evaluations)) {
            event.evaluations.forEach(evaluation => {
              registerEvaluation(evaluation)
            })
          } else {
            fetchFlag(event.identifier)
          }

          break
        case 'delete':
          delete storage[event.identifier]
          eventBus.emit(Event.CHANGED, { flag: event.identifier, value: undefined, deleted: true })
          logDebug('Evaluation deleted', { message: event, storage })
          break
      }
    }

    // check if Evaluation and it's fields are populated
    const isEvaluationValid = (evaluation: Evaluation): boolean => {
      if (!evaluation || !evaluation.flag || !evaluation.identifier || !evaluation.kind || !evaluation.value) {
        return false
      }

      return true
    }

    // check if Evaluations populated and each member is valid
    const areEvaluationsValid = (evaluations: Evaluation[]): boolean => {
      if (!evaluations || evaluations.length == 0 || !evaluations.every(evaluation => isEvaluationValid(evaluation))) {
        return false
      }
      return true
    }

    const handleSegmentEvent = (event: StreamEvent): void => {
      if (event.event === 'patch') {
        if (areEvaluationsValid(event.evaluations)) {
          event.evaluations.forEach(evaluation => {
            registerEvaluation(evaluation)
          })
        } else {
          fetchFlags()
        }
      }
    }

    const url = `${configurations.baseUrl}/stream?cluster=${clusterIdentifier}`

    eventSource = new Streamer(
      eventBus,
      configurations,
      url,
      apiKey,
      standardHeaders,
      poller,
      logDebug,
      logError,
      event => {
        if (event.domain === 'flag') {
          handleFlagEvent(event)
        } else if (event.domain === 'target-segment') {
          handleSegmentEvent(event)
        }
      },
      configurations.maxStreamRetries,
      defaultMiddleware
    )
    eventSource.start()
  }

  const startPolling = () => {
    poller.start()
  }

  const on: EventOnBinding = (event, callback) =>
    eventBus.on(event as unknown as EventType, callback as unknown as WildcardHandler)

  const off: EventOffBinding = (event, callback) => {
    if (event) {
      eventBus.off(event as unknown as '*', callback as unknown as WildcardHandler)
    } else {
      close()
    }
  }

  const handleMetrics = (flag: string, value: any) => {
    if (!canCollectMetrics() || hasProxy || value === undefined) return

    const featureValue = value
    const featureIdentifier = flag

    const entry = metrics.find(
      _entry => _entry.featureIdentifier === featureIdentifier && _entry.featureValue === featureValue
    )

    if (entry) {
      updateMetrics(entry)
      entry.variationIdentifier = evaluations[featureIdentifier as string]?.identifier || ''
    } else {
      metrics.push({
        featureIdentifier: featureIdentifier as string,
        featureValue,
        count: 1,
        variationIdentifier: evaluations[featureIdentifier].identifier || '',
        lastAccessed: Date.now()
      })
    }
  }

  const close = () => {
    closed = true
    if (configurations.streamEnabled) {
      logDebug('Closing event stream')

      if (typeof eventSource?.close === 'function') {
        eventSource.close()
      }

      eventBus.all.clear()
    }

    if (configurations.pollingEnabled && poller.isPolling()) {
      logDebug('Closing Poller')
      poller.stop()
    }
    storage = createStorage()
    evaluations = {}
    clearTimeout(metricsSchedulerId)
  }

  const setEvaluations = (evals: Evaluation[], doDefer = true): void => {
    if (evals.length) {
      defer(() => {
        const hasExistingFlags = !!Object.keys(evaluations).length

        evals.forEach(registerEvaluation)

        if (!hasExistingFlags) {
          stopMetricsCollector()
          const allFlags = { ...storage }
          startMetricsCollector()

          eventBus.emit(Event.READY, allFlags)
        }
      }, doDefer)
    }
  }

  const registerAPIRequestMiddleware = (middleware: APIRequestMiddleware): void => {
    defaultMiddleware = middleware
    fetchWithMiddleware = addMiddlewareToFetch(middleware)
    if (eventSource) eventSource.registerAPIRequestMiddleware(middleware)
  }

  const refreshEvaluations = () => {
    if (initialised && !closed) {
      // only fetch flags if enough time has elapsed to avoid pressuring backend servers
      if (Date.now() - lastCacheRefreshTime >= 60000) {
        fetchFlags()
        lastCacheRefreshTime = Date.now()
      }
    }
  }

  const variation = (identifier: string, defaultValue: any, withDebug = false) => {
    return getVariation(identifier, defaultValue, storage, handleMetrics, eventBus, withDebug)
  }

  return {
    on,
    off,
    close,
    setEvaluations,
    registerAPIRequestMiddleware,
    refreshEvaluations,
    variation: variation as VariationFn
  }
}

export {
  initialize,
  Options,
  Target,
  StreamEvent,
  Event,
  EventOnBinding,
  EventOffBinding,
  Result,
  Evaluation,
  VariationValue,
  DefaultVariationEventPayload
}
