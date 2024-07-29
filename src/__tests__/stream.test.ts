import { Streamer } from '../stream'
import type { Options } from '../types'
import { Event } from '../types'
import {getRandom} from '../utils'
import type { Emitter } from 'mitt'
import type Poller from "../poller";

jest.useFakeTimers()

jest.mock('../utils.ts', () => ({
  getRandom: jest.fn()
}))

const mockEventBus: Emitter = {
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  all: new Map()
}

const mockXHR = {
  open: jest.fn(),
  setRequestHeader: jest.fn(),
  send: jest.fn(),
  abort: jest.fn(),
  status: 0,
  responseText: '',
  onload: null,
  onerror: null,
  onprogress: null,
  onabort: null,
  ontimeout: null
}

global.XMLHttpRequest = jest.fn(() => mockXHR) as unknown as jest.MockedClass<typeof XMLHttpRequest>

const logError = jest.fn()
const logDebug = jest.fn()

const getStreamer = (maxRetries: number, overrides: Partial<Options> = {}): Streamer => {
  const options: Options = {
    baseUrl: 'http://test',
    eventUrl: 'http://event',
    pollingInterval: 60000,
    debug: true,
    pollingEnabled: true,
    streamEnabled: true,
    ...overrides
  }

  return new Streamer(
      mockEventBus,
      options,
      `${options.baseUrl}/stream`,
      'test-api-key',
      { 'Test-Header': 'value' },
      { start: jest.fn(), stop: jest.fn(), isPolling: jest.fn() } as unknown as Poller,
      logDebug,
      logError,
      jest.fn(),
      maxRetries
  )
}

describe('Streamer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should connect and emit CONNECTED event', () => {
    const streamer = getStreamer(3)

    streamer.start()
    expect(mockXHR.open).toHaveBeenCalledWith('GET', 'http://test/stream')
    expect(mockXHR.send).toHaveBeenCalled()

    mockXHR.onprogress({} as ProgressEvent)
    expect(mockEventBus.emit).toHaveBeenCalledWith(Event.CONNECTED)
  })

  it('should retry connecting on error and eventually fallback to polling', () => {
    const streamer = getStreamer(3)

    streamer.start()
    expect(mockXHR.send).toHaveBeenCalled()

    for (let i = 0; i < 3; i++) {
      mockXHR.onerror({} as ProgressEvent)
      jest.advanceTimersByTime(getRandom(1000, 10000))
    }

    expect(mockEventBus.emit).toHaveBeenCalledWith(Event.DISCONNECTED)
    expect(logError).toHaveBeenCalledWith('Streaming:  Max streaming retries reached. Staying in polling mode.')
  })

  it('should not retry after max retries are exhausted', () => {
    const streamer = getStreamer(3)

    streamer.start()
    expect(mockXHR.send).toHaveBeenCalled()

    for (let i = 0; i < 3; i++) {
      mockXHR.onerror({} as ProgressEvent)
      jest.advanceTimersByTime(getRandom(1000, 10000))
    }

    mockXHR.onerror({} as ProgressEvent)
    expect(logError).toHaveBeenCalledWith('Streaming:  Max streaming retries reached. Staying in polling mode.')
    expect(mockEventBus.emit).toHaveBeenCalledWith(Event.DISCONNECTED)
    expect(mockXHR.send).toHaveBeenCalledTimes(3) // Should not send after max retries
  })

  it('should fallback to polling on stream failure', () => {
    const poller = { start: jest.fn(), stop: jest.fn(), isPolling: jest.fn() } as unknown as Poller
    const streamer = new Streamer(
        mockEventBus,
        { baseUrl: 'http://test', eventUrl: 'http://event', pollingEnabled: true, streamEnabled: true, debug: true },
        'http://test/stream',
        'test-api-key',
        { 'Test-Header': 'value' },
        poller,
        logDebug,
        logError,
        jest.fn(),
        Infinity,
    )

    streamer.start()
    expect(mockXHR.send).toHaveBeenCalled()

    mockXHR.onerror({} as ProgressEvent)
    jest.advanceTimersByTime(getRandom(1000, 10000))

    expect(poller.start).toHaveBeenCalled()
    expect(logDebug).toHaveBeenCalledWith('Streaming:  Falling back to polling mode while stream recovers')
  })

  it('should stop polling when close is called if in fallback polling mode', () => {
    const poller = { start: jest.fn(), stop: jest.fn(), isPolling: jest.fn() } as unknown as Poller
    ;(poller.isPolling as jest.Mock)
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => true)

    const streamer = new Streamer(
        mockEventBus,
        { baseUrl: 'http://test', eventUrl: 'http://event', pollingEnabled: true, streamEnabled: true, debug: true },
        'http://test/stream',
        'test-api-key',
        { 'Test-Header': 'value' },
        poller,
        logDebug,
        logError,
        jest.fn(),
        3
    )

    streamer.start()
    expect(mockXHR.send).toHaveBeenCalled()

    // Simulate stream failure and fallback to polling
    mockXHR.onerror({} as ProgressEvent)
    jest.advanceTimersByTime(getRandom(1000, 10000))

    // Ensure polling has started
    expect(poller.start).toHaveBeenCalled()

    // Now close the streamer
    streamer.close()

    expect(mockXHR.abort).toHaveBeenCalled()
    expect(poller.stop).toHaveBeenCalled()
    expect(mockEventBus.emit).toHaveBeenCalledWith(Event.STOPPED)
  })

  it('should stop streaming but not call poller.stop if not in fallback polling mode when close is called', () => {
    const poller = { start: jest.fn(), stop: jest.fn(), isPolling: jest.fn().mockReturnValue(false) } as unknown as Poller
    const streamer = new Streamer(
        mockEventBus,
        { baseUrl: 'http://test', eventUrl: 'http://event', pollingEnabled: true, streamEnabled: true, debug: true },
        'http://test/stream',
        'test-api-key',
        { 'Test-Header': 'value' },
        poller,
        logDebug,
        logError,
        jest.fn(),
        3
    )

    streamer.start()
    streamer.close()

    expect(mockXHR.abort).toHaveBeenCalled()
    expect(poller.stop).not.toHaveBeenCalled()
    expect(mockEventBus.emit).toHaveBeenCalledWith(Event.STOPPED)
  })

  it('should retry indefinitely if maxRetries is set to Infinity', () => {
    const streamer = getStreamer(Infinity)

    streamer.start()
    expect(mockXHR.send).toHaveBeenCalled()

    for (let i = 0; i < 100; i++) {
      mockXHR.onerror({} as ProgressEvent)
      jest.advanceTimersByTime(getRandom(1000, 10000))
    }

    expect(logError).not.toHaveBeenCalledWith('Streaming:  Max streaming retries reached. Staying in polling mode.')
    expect(mockXHR.send).toHaveBeenCalledTimes(101)
  })

  it('should reconnect successfully after multiple failures', () => {
    const streamer = getStreamer(5)

    streamer.start()
    expect(mockXHR.send).toHaveBeenCalled()

    for (let i = 0; i < 3; i++) {
      mockXHR.onerror({} as ProgressEvent)
      jest.advanceTimersByTime(getRandom(1000, 10000))
    }

    // Simulate a successful connection on the next attempt
    mockXHR.onprogress({} as ProgressEvent)

    expect(mockEventBus.emit).toHaveBeenCalledWith(Event.CONNECTED)
    expect(mockXHR.send).toHaveBeenCalledTimes(4) // Should attempt to reconnect 3 times before succeeding
  })
})
