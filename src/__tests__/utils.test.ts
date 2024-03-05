import { getConfiguration, MIN_EVENTS_SYNC_INTERVAL, MIN_POLLING_INTERVAL } from '../utils'
import type { Logger } from '../types'

describe('utils', () => {
  describe('getConfiguration', () => {
    test('it should set defaults', async () => {
      expect(getConfiguration({})).toEqual(
        expect.objectContaining({
          debug: false,
          baseUrl: 'https://config.ff.harness.io/api/1.0',
          eventUrl: 'https://events.ff.harness.io/api/1.0',
          eventsSyncInterval: MIN_EVENTS_SYNC_INTERVAL,
          pollingInterval: MIN_POLLING_INTERVAL,
          streamEnabled: true,
          pollingEnabled: true,
          cache: false
        })
      )
    })

    test('it should enable polling when streaming is enabled', async () => {
      const result = getConfiguration({ streamEnabled: true })

      expect(result).toHaveProperty('pollingEnabled', true)
      expect(result).toHaveProperty('streamEnabled', true)
    })

    test('it should disable polling when streaming is disabled', async () => {
      const result = getConfiguration({ streamEnabled: false })

      expect(result).toHaveProperty('pollingEnabled', false)
      expect(result).toHaveProperty('streamEnabled', false)
    })

    test('it should enable polling when streaming is disabled and polling is enabled', async () => {
      const result = getConfiguration({ pollingEnabled: true, streamEnabled: false })

      expect(result).toHaveProperty('pollingEnabled', true)
      expect(result).toHaveProperty('streamEnabled', false)
    })

    test('it should not allow eventsSyncInterval to be set below 60s', async () => {
      expect(getConfiguration({ eventsSyncInterval: 1000 })).toHaveProperty(
        'eventsSyncInterval',
        MIN_EVENTS_SYNC_INTERVAL
      )
    })

    test('it should allow eventsSyncInterval to be set above 60s', async () => {
      expect(getConfiguration({ eventsSyncInterval: 100000 })).toHaveProperty('eventsSyncInterval', 100000)
    })

    test('it should not allow pollingInterval to be set below 60s', async () => {
      expect(getConfiguration({ pollingInterval: 1000 })).toHaveProperty('pollingInterval', MIN_POLLING_INTERVAL)
    })

    test('it should allow pollingInterval to be set above 60s', async () => {
      expect(getConfiguration({ pollingInterval: 100000 })).toHaveProperty('pollingInterval', 100000)
    })

    test('it should use console as a logger by default', async () => {
      expect(getConfiguration({})).toHaveProperty('logger', console)
    })

    test('it should allow the default logger to be overridden', async () => {
      const logger: Logger = {
        debug: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn()
      }

      const result = getConfiguration({ logger })
      expect(result).toHaveProperty('logger', logger)

      result.logger.debug('hello')
      expect(logger.debug).toHaveBeenCalledWith('hello')
    })
  })
})
