import jwt_decode from 'jwt-decode'
import mitt from 'mitt'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { Options, Target, StreamEvent, Event, EventCallback, Result, Evaluation, VariationValue } from './types'
import { logError, defaultOptions, METRICS_FLUSH_INTERVAL } from './utils'

const fetch = globalThis.fetch || require('node-fetch')

// event-source-polyfil works great in browsers, but not under node
// eventsource works great under node, but can't be bundled for browsers
const EventSource = globalThis.fetch ? EventSourcePolyfill : require('eventsource')

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
        value = value.toLocaleString() === 'true'
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

const initialize = (apiKey: string, target: Target, options: Options): Result => {
  let environment: string
  let eventSource: any
  let jwtToken: string
  let metricsSchedulerId
  let metrics: Array<{ featureIdentifier: string; featureValue: string; count: number }> = []
  const eventBus = mitt()
  const configurations = { ...defaultOptions, ...options }
  const logDebug = (message: string, ...args: any[]) => {
    if (configurations.debug) {
      // tslint:disable-next-line:no-console
      console.debug(`[FF-SDK] ${message}`, ...args)
    }
  }

  globalThis.onbeforeunload = () => {
    if (metrics.length && globalThis.localStorage) {
      globalThis.localStorage.HARNESS_FF_METRICS = JSON.stringify(metrics)
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
      logDebug('Sending metrics...', metrics)
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
              key: 'featureValue',
              value: String(entry.featureValue)
            },
            {
              key: 'target',
              value: JSON.stringify(target)
            },
            {
              key: 'SDK_NAME',
              value: 'JavaScript'
            },
            {
              key: 'SDK_TYPE',
              value: 'client'
            }
          ]
        }))
      }

      fetch(`${options.eventUrl}/metrics/${environment}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwtToken}` },
        body: JSON.stringify(payload)
      })
        .then(() => {
          metrics = []
        })
        .catch(error => {
          logError(error)
        })
        .finally(() => {
          metricsSchedulerId = setTimeout(scheduleSendingMetrics, METRICS_FLUSH_INTERVAL)
        })
    } else {
      metricsSchedulerId = setTimeout(scheduleSendingMetrics, METRICS_FLUSH_INTERVAL)
    }
  }

  const creatStorage = function () {
    return hasProxy
      ? new Proxy(
          {},
          {
            get(target, featureIdentifier) {
              if (target.hasOwnProperty(featureIdentifier)) {
                const featureValue = target[featureIdentifier]
                const entry = metrics.find(
                  _entry => _entry.featureIdentifier === featureIdentifier && _entry.featureValue === featureValue
                )

                if (entry) {
                  entry.count++
                } else {
                  metrics.push({
                    featureIdentifier: featureIdentifier as string,
                    featureValue,
                    count: 1
                  })
                }
                logDebug('Metrics event: Flag', featureIdentifier, 'has been read with value', featureValue)
              }
              return target[featureIdentifier]
            }
          }
        )
      : {}
  }

  let storage: Record<string, any> = creatStorage()

  authenticate(apiKey, configurations)
    .then((token: string) => {
      jwtToken = token
      const decoded: { environment: string } = jwt_decode(token)

      logDebug('Authenticated', decoded)

      if (globalThis.localStorage && globalThis.localStorage.HARNESS_FF_METRICS) {
        try {
          metrics = JSON.parse(globalThis.localStorage.HARNESS_FF_METRICS)
          logDebug('Picking up metrics from previous session')
        } catch (error) {}
      }

      metricsSchedulerId = setTimeout(scheduleSendingMetrics, METRICS_FLUSH_INTERVAL)

      environment = decoded.environment

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
                count: 1
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
        `${configurations.baseUrl}/client/env/${environment}/target/${target.identifier}/evaluations`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`
          }
        }
      )
      const data = await res.json()

      data.forEach((_evaluation: Evaluation) => {
        storage[_evaluation.flag] = convertValue(_evaluation)
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
        `${configurations.baseUrl}/client/env/${environment}/target/${target.identifier}/evaluations/${identifier}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`
          }
        }
      )

      if (result.ok) {
        const flagInfo: Evaluation = await result.json()
        storage[identifier] = convertValue(flagInfo)

        eventBus.emit(
          Event.CHANGED,
          hasProxy
            ? new Proxy(flagInfo, {
                get(target, property) {
                  if (target.hasOwnProperty(property) && property === 'value') { // only track metric when value is read
                    const featureIdentifier = target.flag
                    const featureValue = flagInfo.value
                    const entry = metrics.find(
                      _entry => _entry.featureIdentifier === featureIdentifier && _entry.featureValue === featureValue
                    )

                    if (entry) {
                      entry.count++
                    } else {
                      metrics.push({
                        featureIdentifier: property as string,
                        featureValue: String(featureValue),
                        count: 1
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
            entry.count++
          } else {
            metrics.push({
              featureIdentifier: featureIdentifier as string,
              featureValue: String(flagInfo.value),
              count: 1
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
    eventSource = new EventSource(`${configurations.baseUrl}/stream`, {
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
      eventBus.emit('error', event)
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
          // TODO: Delete flag from storage
          break
      }
    })
  }

  const on = (event: Event, callback: EventCallback): void => eventBus.on(event, callback)

  const off = (event?: Event, callback?: EventCallback): void => {
    if (event) {
      eventBus.off(event, callback)
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
        entry.count++
      } else {
        metrics.push({
          featureIdentifier: featureIdentifier as string,
          featureValue,
          count: 1
        })
      }
    }

    return value !== undefined ? value : defaultValue
  }

  const close = () => {
    logDebug('Closing event stream')
    storage = creatStorage()
    clearTimeout(metricsSchedulerId)
    eventBus.all.clear()
    eventSource.close()
  }

  return { on, off, variation, close }
}

export { initialize, Options, Target, StreamEvent, Event, EventCallback, Result, Evaluation, VariationValue }
