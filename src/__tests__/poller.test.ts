import Poller from '../poller'
import type { FetchFlagsResult, Options } from '../types'
import { getRandom } from '../utils'
import { Event } from '../types'

jest.useFakeTimers()

jest.mock('../utils.ts', () => ({
  getRandom: jest.fn(),
  logError: jest.fn()
}))

const mockEventBus = {
  emit: jest.fn()
}

interface PollerArgs {
  fetchFlags: jest.MockedFunction<() => Promise<FetchFlagsResult>>
  eventBus: typeof mockEventBus
  storage: Record<string, any>
  configurations: Partial<Options>
}

interface TestArgs {
  delayFunction: jest.MockedFunction<() => number>
  logSpy: jest.SpyInstance
  mockError: Error
  delayMs: number
}

let currentPoller: Poller
const getPoller = (overrides: Partial<PollerArgs> = {}): Poller => {
  const args: PollerArgs = {
    fetchFlags: jest.fn(),
    configurations: {},
    eventBus: mockEventBus,
    storage: {},
    ...overrides
  }

  currentPoller = new Poller(args.fetchFlags, args.configurations, args.eventBus, args.storage)

  return currentPoller
}

const getTestArgs = (overrides: Partial<TestArgs> = {}): TestArgs => {
  const { delayMs = 5000 } = overrides // Extract delayMs or set a default of 5000

  return {
    delayMs,
    delayFunction: (getRandom as jest.Mock).mockReturnValue(delayMs),
    logSpy: jest.spyOn(console, 'debug').mockImplementation(() => {}),
    mockError: new Error('Fetch Error'),
    ...overrides
  }
}

describe('Poller', () => {
  afterEach(() => {
    jest.clearAllMocks()
    currentPoller?.stop()
  })
  it('should not start polling if it is already polling', () => {
    getPoller({ configurations: { debug: true } })
    const testArgs = getTestArgs()

    currentPoller.start()
    currentPoller.start()
    expect(testArgs.logSpy).toHaveBeenCalledTimes(2)

    expect(mockEventBus.emit).toHaveBeenCalled()
  })

  it('should retry fetching if there is an error', async () => {
    const testArgs = getTestArgs()

    let attemptCount = 0
    const fetchFlagsMock: jest.Mock<Promise<FetchFlagsResult>> = jest
      .fn()
      .mockImplementation((): Promise<FetchFlagsResult> => {
        attemptCount++

        // Return null (success) on the maxAttempts-th call, error otherwise.
        return Promise.resolve(
          attemptCount === 2
            ? {
                type: 'success',
                data: [{ flag: 'flag1', kind: 'boolean', value: true, identifier: 'true' }]
              }
            : ({ type: 'error', error: testArgs.mockError } as FetchFlagsResult)
        )
      })

    const pollInterval = 60000

    getPoller({
      fetchFlags: fetchFlagsMock,
      configurations: { pollingInterval: pollInterval, debug: true }
    })

    currentPoller.start()

    jest.advanceTimersByTime(pollInterval)

    // Allow first attempt to resolve
    await Promise.resolve()

    // Advance past the first delay
    jest.advanceTimersByTime(testArgs.delayMs)

    // Allow successful attempt to resolve
    await Promise.resolve()

    expect(fetchFlagsMock).toHaveBeenCalledTimes(2)
    expect(testArgs.logSpy).toHaveBeenCalledTimes(2)
  })

  it('should not retry after max attempts are exceeded', async () => {
    const maxAttempts = 5
    let attemptCount = 0

    const fetchFlagsMock: jest.Mock<Promise<FetchFlagsResult>> = jest
      .fn()
      .mockImplementation((): Promise<FetchFlagsResult> => {
        attemptCount++

        // Return null (success) on the maxAttempts-th call, error otherwise.
        // return Promise.resolve(attemptCount === maxAttempts ? null : mockError)

        return Promise.resolve(
          attemptCount === maxAttempts
            ? {
                type: 'success',
                data: [{ flag: 'flag1', kind: 'boolean', value: true, identifier: 'true' }]
              }
            : ({ type: 'error', error: testArgs.mockError } as FetchFlagsResult)
        )
      })

    const pollInterval = 60000

    getPoller({
      fetchFlags: fetchFlagsMock,
      configurations: { pollingInterval: pollInterval, debug: true }
    })

    const testArgs = getTestArgs()

    currentPoller.start()

    jest.advanceTimersByTime(pollInterval)

    for (let i = 0; i < maxAttempts; i++) {
      jest.advanceTimersByTime(testArgs.delayMs)
      // We need to wait for the fetchFlags promise and the timeout promise to resolve
      await Promise.resolve()
      await Promise.resolve()
    }

    expect(fetchFlagsMock).toHaveBeenCalledTimes(5)
    expect(testArgs.logSpy).toHaveBeenCalledTimes(6)
  })

  it('should successfully fetch flags without retrying on success', async () => {
    const pollInterval = 60000
    const fetchFlagsMock: jest.Mock<Promise<FetchFlagsResult>> = jest
      .fn()
      .mockImplementation((): Promise<FetchFlagsResult> => {
        // Return null (success) on the maxAttempts-th call, error otherwise.
        // return Promise.resolve(attemptCount === maxAttempts ? null : mockError)

        return Promise.resolve({
          type: 'success',
          data: [{ flag: 'flag1', kind: 'boolean', value: true, identifier: 'true' }]
        })
      })

    getPoller({
      fetchFlags: fetchFlagsMock,
      configurations: { pollingInterval: pollInterval, debug: true }
    })
    const testArgs = getTestArgs()

    currentPoller.start()
    jest.advanceTimersByTime(pollInterval)
    await Promise.resolve()

    expect(fetchFlagsMock).toHaveBeenCalledTimes(1)
    expect(testArgs.logSpy).toHaveBeenCalledTimes(2)
  })

  it('should stop polling when stop is called', () => {
    const pollInterval = 60000
    const fetchFlagsMock = jest.fn().mockResolvedValue(null)

    getPoller({
      fetchFlags: fetchFlagsMock,
      configurations: { pollingInterval: pollInterval, debug: true }
    })

    // Use this just to mock the calls to console.debug
    getTestArgs()


    // Start the poller
    currentPoller.start()

    expect(mockEventBus.emit).toHaveBeenCalledWith(Event.POLLING)

    // At this point, the poller will be scheduled to run after the pollingInterval.
    // Before advancing the timers, we stop the poller.
    currentPoller.stop()

    // Now we'll check that eventBus.emit was called with POLLING_STOPPED.
    expect(mockEventBus.emit).toHaveBeenCalledWith(Event.POLLING_STOPPED)

    // Ensure that fetchFlags isn't called after the poller has been stopped
    expect(fetchFlagsMock).not.toHaveBeenCalled()

    // As a final check, advance timers to ensure that the poller doesn't poll after an elapsed interval.
    jest.advanceTimersByTime(pollInterval)

    expect(fetchFlagsMock).not.toHaveBeenCalled()
  })
})
