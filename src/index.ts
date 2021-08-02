import jwt_decode from 'jwt-decode'
import mitt, { EventType, WildcardHandler } from 'mitt'
import { EventSourcePolyfill } from './eventsource'
import type {
  Options,
  Target,
  StreamEvent,
  EventOnBinding,
  EventOffBinding,
  Result,
  Evaluation,
  VariationValue,
  MetricsInfo
} from './types'
import { Event } from './types'
import { logError, defaultOptions, METRICS_FLUSH_INTERVAL } from './utils'

const SDK_VERSION = '1.4.7'
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
  let environment: string
  let clusterIdentifier: string
  let eventSource: any
  let jwtToken: string
  let metricsSchedulerId: number
  let metricsCollectorEnabled = true
  const stopMetricsCollector = () => {
    metricsCollectorEnabled = false
  }
  const startMetricsCollector = () => {
    metricsCollectorEnabled = true
  }
  let metrics: Array<MetricsInfo> = []
  const eventBus = mitt()
  const configurations = { ...defaultOptions, ...options }
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
      body: JSON.stringify({ apiKey: clientID, target })
    })

    const data: { authToken: string } = await response.json()

    return data.authToken
  }

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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwtToken}` },
        body: JSON.stringify(payload)
      })
        .then(() => {
          metrics = []
        })
        .catch(error => {
          logDebug(error)
        })
        .finally(() => {
          metricsSchedulerId = window.setTimeout(scheduleSendingMetrics, METRICS_FLUSH_INTERVAL)
        })
    } else {
      metricsSchedulerId = window.setTimeout(scheduleSendingMetrics, METRICS_FLUSH_INTERVAL)
    }
  }

  let evaluations: Record<string, Evaluation> = {}

  const creatStorage = function () {
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

  let storage: Record<string, any> = creatStorage()

  authenticate(apiKey, configurations)
    .then((token: string) => {
      jwtToken = token
      const decoded: { environment: string, clusterIdentifier: string } = jwt_decode(token)

      logDebug('Authenticated', decoded)

      if (globalThis.localStorage && globalThis.localStorage.HARNESS_FF_METRICS) {
        try {
          // metrics = JSON.parse(globalThis.localStorage.HARNESS_FF_METRICS)
          delete globalThis.localStorage.HARNESS_FF_METRICS
          logDebug('Picking up metrics from previous session')
        } catch (error) {}
      }

      metricsSchedulerId = window.setTimeout(scheduleSendingMetrics, METRICS_FLUSH_INTERVAL)

      environment = decoded.environment
      clusterIdentifier = decoded.clusterIdentifier

      // When authentication is done, fetch all flags
      fetchFlags()
        .then(() => {
          logDebug('Fetch all flags ok', storage)
        })
        .then(() => {
          startStream() // start stream only after we get all evaluations
        })
        .then(() => {
          logDebug('Event stream ready', { storage })
          eventBus.emit(Event.READY, storage)

          if (!hasProxy) {
            Object.keys(storage).forEach(key => {
              metrics.push({
                featureIdentifier: key,
                featureValue: storage[key],
                variationIdentifier: evaluations[key]?.identifier || '',
                count: metricsCollectorEnabled ? 1 : 0,
                lastAccessed: Date.now()
              })
            })
          }
        })
        .catch(err => {
          eventBus.emit(Event.ERROR, err)
        })
    })
    .catch(error => {
      logError('Authentication error: ', error)
      eventBus.emit(Event.ERROR, error)
    })

  const fetchFlags = async () => {
    try {
      const res = await fetch(
        `${configurations.baseUrl}/client/env/${environment}/target/${target.identifier}/evaluations?cluster=${clusterIdentifier}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`
          }
        }
      )
      const data = await res.json()

      data.forEach((_evaluation: Evaluation) => {
        const _value = convertValue(_evaluation)
        storage[_evaluation.flag] = _value
        evaluations[_evaluation.flag] = { ..._evaluation, value: _value }
      })
    } catch (error) {
      logError('Features fetch operation error: ', error)
      eventBus.emit(Event.ERROR, error)
      return error
    }
  }

  const fetchFlag = async (identifier: string) => {
    try {
      const result = await fetch(
        `${configurations.baseUrl}/client/env/${environment}/target/${target.identifier}/evaluations/${identifier}?cluster=${clusterIdentifier}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`
          }
        }
      )

      if (result.ok) {
        const flagInfo: Evaluation = await result.json()
        const _value = convertValue(flagInfo)

        stopMetricsCollector()
        storage[identifier] = _value
        evaluations[identifier] = { ...flagInfo, value: _value }
        startMetricsCollector()

        eventBus.emit(
          Event.CHANGED,
          hasProxy
            ? new Proxy(flagInfo, {
                get(_flagInfo, property) {
                  if (_flagInfo.hasOwnProperty(property) && property === 'value') {
                    // only track metric when value is read
                    const featureIdentifier = _flagInfo.flag
                    const featureValue = flagInfo.value
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
                    logDebug(
                      'Metrics event: Flag',
                      property,
                      'has been read with value via stream update',
                      featureValue
                    )
                  }

                  return property === 'value' ? convertValue(flagInfo) : flagInfo[property]
                }
              })
            : {
                deleted: flagInfo.deleted,
                flag: flagInfo.flag,
                value: convertValue(flagInfo)
              }
        )

        if (!hasProxy) {
          const featureIdentifier = flagInfo.flag
          const entry = metrics.find(
            _entry => _entry.featureIdentifier === featureIdentifier && _entry.featureValue === flagInfo.value
          )

          if (entry) {
            updateMetrics(entry)
            entry.variationIdentifier = evaluations[featureIdentifier as string]?.identifier || ''
          } else {
            metrics.push({
              featureIdentifier: featureIdentifier as string,
              featureValue: String(flagInfo.value),
              variationIdentifier: evaluations[featureIdentifier].identifier || '',
              count: metricsCollectorEnabled ? 1 : 0,
              lastAccessed: Date.now()
            })
          }
        }
      } else {
        eventBus.emit(Event.ERROR, result)
      }
    } catch (error) {
      logError('Feature fetch operation error: ', error)
      eventBus.emit(Event.ERROR, error)
    }
  }

  const startStream = () => {
    // TODO: Implement polling when stream is disabled
    if (!configurations.streamEnabled) {
      logDebug('Stream is disabled by configuration. Note: Polling is not yet supported')
      return
    }
    eventSource = new EventSource(`${configurations.baseUrl}/stream?cluster=${clusterIdentifier}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'API-Key': apiKey
      }
    })

    eventSource.onopen = (event: any) => {
      logDebug('Stream connected', event)
      eventBus.emit(Event.CONNECTED)
    }

    eventSource.onclose = (event: any) => {
      logDebug('Stream disconnected')
      eventBus.emit(Event.DISCONNECTED)
    }

    eventSource.onerror = (event: any) => {
      logError('Stream has issue', event)
      eventBus.emit(Event.ERROR, event)
    }

    eventSource.addEventListener('*', (msg: any) => {
      const event: StreamEvent = JSON.parse(msg.data)

      logDebug('Received event from stream: ', event)

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
    })
  }

  const on: EventOnBinding = (event, callback) => eventBus.on(event as unknown as EventType, callback as unknown as WildcardHandler)

  const off: EventOffBinding = (event, callback) => {
    if (event) {
      eventBus.off(event as unknown as '*', callback as unknown as WildcardHandler)
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
    logDebug('Closing event stream')
    storage = creatStorage()
    evaluations = {}
    clearTimeout(metricsSchedulerId)
    eventBus.all.clear()
    eventSource.close()
  }

  return { on, off, variation, close }
}

export { initialize, Options, Target, StreamEvent, Event, EventOnBinding, EventOffBinding, Result, Evaluation, VariationValue }
