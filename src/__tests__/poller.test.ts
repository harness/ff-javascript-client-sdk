import Poller from '../poller'
import type { Options } from '../types'
import { getRandom } from '../utils'

jest.useFakeTimers()

jest.mock('../utils.ts', () => ({
  getRandom: jest.fn(),
  logError: jest.fn()
}))

interface PollerArgs {
  fetchFlags: jest.MockedFunction<() => Promise<any>>
  configurations: Partial<Options>
}

interface TestArgs {
  delayFunction: jest.MockedFunction<() => number>
  logSpy: jest.SpyInstance
  mockError: Error
  delayMs: number
}

const getPoller = (overrides: Partial<PollerArgs> = {}): Poller => {
  const args: PollerArgs = {
    fetchFlags: jest.fn(),
    configurations: {},
    ...overrides
  }

  return new Poller(args.fetchFlags, args.configurations)
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
  it('should not start polling if it is already polling', () => {
    const poller = getPoller({ configurations: { debug: true } })
    getTestArgs()

    poller.start()
    poller.start()
  })

  it('should retry fetching if there is an error', async () => {
    const testArgs = getTestArgs()

    let attemptCount = 0
    const fetchFlagsMock = jest.fn().mockImplementation(() => {
      attemptCount++

      // Return null (success) on the maxAttempts-th call, error otherwise.
      return Promise.resolve(attemptCount === 2 ? null : testArgs.mockError)
    })

    const pollInterval = 60000

    const poller = getPoller({
      fetchFlags: fetchFlagsMock,
      configurations: { pollingInterval: pollInterval, debug: true }
    })

    poller.start()

    jest.advanceTimersByTime(pollInterval)

    // Allow first attempt to resolve
    await Promise.resolve()

    // Advance past the first delay
    jest.advanceTimersByTime(testArgs.delayMs)

    // Allow successful attempt to resolve
    await Promise.resolve()

    expect(fetchFlagsMock).toHaveBeenCalledTimes(2)
  })

  it('should not retry after max attempts are exceeded', async () => {
    const maxAttempts = 5
    let attemptCount = 0

    const mockError = new Error('Fetch Error')

    const fetchFlagsMock = jest.fn().mockImplementation(() => {
      attemptCount++

      // Return null (success) on the maxAttempts-th call, error otherwise.
      return Promise.resolve(attemptCount === maxAttempts ? null : mockError)
    })

    const pollInterval = 60000

    const poller = getPoller({
      fetchFlags: fetchFlagsMock,
      configurations: { pollingInterval: pollInterval, debug: true }
    })

    const testArgs = getTestArgs()

    poller.start()

    jest.advanceTimersByTime(pollInterval)

    for (let i = 0; i < maxAttempts; i++) {
      jest.advanceTimersByTime(testArgs.delayMs)
      // We need to wait for the fetchFlags promise and the timeout promise to resolve
      await Promise.resolve()
      await Promise.resolve()
    }

    expect(fetchFlagsMock).toHaveBeenCalledTimes(5)
  })

  it('should successfully fetch flags without retrying on success', async () => {
    const pollInterval = 60000
    const fetchFlagsMock = jest.fn().mockResolvedValue(null)

    const poller = getPoller({
      fetchFlags: fetchFlagsMock,
      configurations: { pollingInterval: pollInterval, debug: true }
    })
    getTestArgs()

    poller.start()
    jest.advanceTimersByTime(pollInterval)
    await Promise.resolve()

    expect(fetchFlagsMock).toHaveBeenCalledTimes(1)
  })
})
