import jwt_decode from 'jwt-decode'
import mitt, { EventType, WildcardHandler } from 'mitt'
import { EventSourcePolyfill } from './eventsource'
import type {
  Evaluation,
  EventOffBinding,
  EventOnBinding,
  MetricsInfo,
  Options,
  Result,
  StreamEvent,
  Target,
  VariationValue
} from './types'
import { Event } from './types'
import { defaultOptions, defer, logError, MIN_EVENTS_SYNC_INTERVAL } from './utils'
import { loadFromCache, removeCachedEvaluation, saveToCache, updateCachedEvaluation } from './cache'

const SDK_VERSION = '1.9.1'
const METRICS_VALID_COUNT_INTERVAL = 500
const fetch = globalThis.fetch
const EventSource = EventSourcePolyfill

// Flag to detect is Proxy is supported (not under IE 11)
const hasProxy = !!globalThis.Proxy

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

const initialize = (apiKey: string, target: Target, options?: Options): Result => {
  let closed = false
  let environment: string
  let clusterIdentifier: string
  let eventSource: any
  let jwtToken: string
  let metricsSchedulerId: number
  let metricsCollectorEnabled = true
  let standardHeaders: Record<string, string> = {}

  const stopMetricsCollector = () => {
    metricsCollectorEnabled = false
  }
  const startMetricsCollector = () => {
    metricsCollectorEnabled = true
  }
  let metrics: Array<MetricsInfo> = []
  const eventBus = mitt()
  const configurations = { ...defaultOptions, ...options }

  if (configurations.eventsSyncInterval < MIN_EVENTS_SYNC_INTERVAL) {
    configurations.eventsSyncInterval = MIN_EVENTS_SYNC_INTERVAL
  }

  const logDebug = (message: string, ...args: any[]) => {
    if (configurations.debug) {
      // tslint:disable-next-line:no-console
      console.debug(`[FF-SDK] ${message}`, ...args)
    }
  }
  const updateMetrics = (metricsInfo: MetricsInfo) => {
    if (metricsCollectorEnabled) {
      const now = Date.now()

      if (now - metricsInfo.lastAccessed > METRICS_VALID_COUNT_INTERVAL) {
        metricsInfo.count++
        metricsInfo.lastAccessed = now
      }
    }
  }

  globalThis.onbeforeunload = () => {
    if (metrics.length && globalThis.localStorage) {
      stopMetricsCollector()
      globalThis.localStorage.HARNESS_FF_METRICS = JSON.stringify(metrics)
      startMetricsCollector()
    }
  }

  const authenticate = async (clientID: string, configuration: Options): Promise<string> => {
    const response = await fetch(`${configuration.baseUrl}/client/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: clientID,
        target: { ...target, identifier: String(target.identifier) }
      })
    })

    const data: { authToken: string } = await response.json()

    return data.authToken
  }

  let failedMetricsCallCount = 0

  const scheduleSendingMetrics = () => {
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

      fetch(`${configurations.eventUrl}/metrics/${environment}?cluster=${clusterIdentifier}`, {
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
            if (_flagInfo.hasOwnProperty(property) && property === 'value') {
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
                  count: metricsCollectorEnabled ? 1 : 0,
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

              if (_storage.hasOwnProperty(property)) {
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
                    count: metricsCollectorEnabled ? 1 : 0,
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

  authenticate(apiKey, configurations)
    .then((token: string) => {
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
        'Harness-EnvironmentID': decoded.environmentIdentifier
      }

      logDebug('Authenticated', decoded)

      if (globalThis.localStorage && globalThis.localStorage.HARNESS_FF_METRICS) {
        try {
          // metrics = JSON.parse(globalThis.localStorage.HARNESS_FF_METRICS)
          delete globalThis.localStorage.HARNESS_FF_METRICS
          logDebug('Picking up metrics from previous session')
        } catch (error) {}
      }

      metricsSchedulerId = window.setTimeout(scheduleSendingMetrics, configurations.eventsSyncInterval)

      environment = decoded.environment
      clusterIdentifier = decoded.clusterIdentifier

      const hasExistingFlags = !!Object.keys(evaluations).length

      // When authentication is done, fetch all flags
      fetchFlags()
        .then(() => {
          logDebug('Fetch all flags ok', storage)
        })
        .then(() => {
          if (closed) return

          startStream() // start stream only after we get all evaluations
        })
        .then(() => {
          if (closed) return

          logDebug('Event stream ready', { storage })

          // emit the ready event only if flags weren't already set using setEvaluations
          if (!hasExistingFlags) {
            eventBus.emit(Event.READY, { ...storage })
          }
        })
        .catch(err => {
          eventBus.emit(Event.ERROR, err)
        })
    })
    .catch(error => {
      logError('Authentication error: ', error)
      eventBus.emit(Event.ERROR_AUTH, error)
      eventBus.emit(Event.ERROR, error)
    })

  const fetchFlags = async () => {
    try {
      const res = await fetch(
        `${configurations.baseUrl}/client/env/${environment}/target/${target.identifier}/evaluations?cluster=${clusterIdentifier}`,
        {
          headers: standardHeaders
        }
      )

      if (res.ok) {
        const data = await res.json()
        data.forEach(registerEvaluation)
        eventBus.emit(Event.FLAGS_LOADED, data)
      } else {
        logError('Features fetch operation error: ', res)
        eventBus.emit(Event.ERROR_FETCH_FLAGS, res)
        eventBus.emit(Event.ERROR, res)
      }
    } catch (error) {
      logError('Features fetch operation error: ', error)
      eventBus.emit(Event.ERROR_FETCH_FLAGS, error)
      eventBus.emit(Event.ERROR, error)
      return error
    }
  }

  const fetchFlag = async (identifier: string) => {
    try {
      const result = await fetch(
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
      evaluations[evaluation.flag] = { ...evaluation, value: value }
      sendEvent(evaluation)
    }
    startMetricsCollector()
  }

  const startStream = () => {
    // TODO: Implement polling when stream is disabled
    if (!configurations.streamEnabled) {
      logDebug('Stream is disabled by configuration. Note: Polling is not yet supported')
      return
    }
    eventSource = new EventSource(`${configurations.baseUrl}/stream?cluster=${clusterIdentifier}`, {
      headers: {
        'API-Key': apiKey,
        ...standardHeaders
      }
    })

    eventSource.onopen = (event: any) => {
      logDebug('Stream connected', event)
      eventBus.emit(Event.CONNECTED)
    }

    eventSource.onclose = () => {
      logDebug('Stream disconnected')
      eventBus.emit(Event.DISCONNECTED)
    }

    eventSource.onerror = (event: any) => {
      logError('Stream has issue', event)
      eventBus.emit(Event.ERROR_STREAM, event)
      eventBus.emit(Event.ERROR, event)
    }

    const handleFlagEvent = (event: StreamEvent): void => {
      switch (event.event) {
        case 'create':
          setTimeout(() => fetchFlag(event.identifier), 1000) // Wait a bit before fetching evaluation due to https://harness.atlassian.net/browse/FFM-583
          break
        case 'patch':
          fetchFlag(event.identifier)
          break
        case 'delete':
          delete storage[event.identifier]
          eventBus.emit(Event.CHANGED, { flag: event.identifier, value: undefined, deleted: true })
          logDebug('Evaluation deleted', { message: event, storage })
          break
      }
    }

    const handleSegmentEvent = (event: StreamEvent): void => {
      if (event.event === 'patch') {
        fetchFlags()
      }
    }

    eventSource.addEventListener('*', (msg: any) => {
      const event: StreamEvent = JSON.parse(msg.data)

      logDebug('Received event from stream: ', event)

      if (event.domain === 'flag') {
        handleFlagEvent(event)
      } else if (event.domain === 'target-segment') {
        handleSegmentEvent(event)
      }
    })
  }

  const on: EventOnBinding = (event, callback) =>
    eventBus.on((event as unknown) as EventType, (callback as unknown) as WildcardHandler)

  const off: EventOffBinding = (event, callback) => {
    if (event) {
      eventBus.off((event as unknown) as '*', (callback as unknown) as WildcardHandler)
    } else {
      close()
    }
  }

  const variation = (flag: string, defaultValue: any) => {
    const value = storage[flag]

    if (!hasProxy && value !== undefined) {
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
          count: metricsCollectorEnabled ? 1 : 0,
          variationIdentifier: evaluations[featureIdentifier].identifier || '',
          lastAccessed: Date.now()
        })
      }
    }

    return value !== undefined ? value : defaultValue
  }

  const close = () => {
    closed = true

    logDebug('Closing event stream')
    storage = createStorage()
    evaluations = {}
    clearTimeout(metricsSchedulerId)
    eventBus.all.clear()

    if (typeof eventSource?.close === 'function') {
      eventSource.close()
    }
  }

  const setEvaluations = (evals: Evaluation[], doDefer = true): void => {
    if (evals.length) {
      defer(() => {
        const hasExistingFlags = !!Object.keys(evaluations).length

        evals.forEach(registerEvaluation)

        if (!hasExistingFlags) {
          eventBus.emit(Event.READY, { ...storage })
        }
      }, doDefer)
    }
  }

  if (configurations.cache && 'localStorage' in window) {
    let initialLoad = true

    const cachedEvaluations = loadFromCache(target.identifier)
    if (cachedEvaluations) {
      defer(() => {
        setEvaluations(cachedEvaluations, false)
        eventBus.emit(Event.CACHE_LOADED, cachedEvaluations)
      })
    }

    on(Event.FLAGS_LOADED, evaluations => {
      saveToCache(target.identifier, evaluations)
      initialLoad = false
    })

    on(Event.CHANGED, evaluation => {
      if (!initialLoad) {
        if (evaluation.deleted) {
          removeCachedEvaluation(target.identifier, evaluation.flag)
        } else {
          updateCachedEvaluation(target.identifier, evaluation)
        }
      }
    })
  }

  return { on, off, variation, close, setEvaluations }
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
  VariationValue
}
