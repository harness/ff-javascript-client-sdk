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
  pollInterval: number
  maxAttempts: number
}

interface TestArgs {
  delayFunction: jest.MockedFunction<() => number>
  logSpy: jest.SpyInstance
  delayMs: number
}

const getPoller = (overrides: Partial<PollerArgs> = {}): { poller: Poller; pollerArgs: PollerArgs } => {
  const args: PollerArgs = {
    fetchFlags: jest.fn(),
    configurations: { pollingInterval: 60000, debug: true },
    pollInterval: 60000,
    maxAttempts: 5,
    ...overrides
  }

  return {
    poller: new Poller(args.fetchFlags, args.configurations),
    pollerArgs: args
  }
}

const getTestArgs = (overrides: Partial<TestArgs> = {}): TestArgs => {
  const { delayMs = 5000 } = overrides // Extract delayMs or set a default of 5000

  return {
    delayMs,
    delayFunction: (getRandom as jest.Mock).mockReturnValue(delayMs),
    logSpy: jest.spyOn(console, 'debug').mockImplementation(() => {}),
    ...overrides
  }
}

describe('Poller', () => {
  it('should not start polling if it is already polling', () => {
    const { poller } = getPoller()
    const testArgs = getTestArgs()

    poller.start()
    poller.start()

    expect(testArgs.logSpy).toHaveBeenCalled()
  })

  it('should retry fetching if there is an error', async () => {
    const { poller, pollerArgs } = getPoller()
    const fetchFlags = pollerArgs.fetchFlags
    let error = new Error('Fetch Error')
    fetchFlags.mockResolvedValue(error)

    const testArgs = getTestArgs()

    poller.start()

    jest.advanceTimersByTime(pollerArgs.configurations.pollingInterval)

    // Allow first attempt to resolve
    await Promise.resolve()

    // Advance past the first delay
    jest.advanceTimersByTime(testArgs.delayMs)

    // Allow successful attempt to resolve
    await Promise.resolve()

    expect(fetchFlags).toHaveBeenCalledTimes(2)
    expect(testArgs.logSpy).toHaveBeenCalled()
  })

  it('should not retry after max attempts are exceeded', async () => {
    const { poller, pollerArgs } = getPoller()
    const fetchFlags = pollerArgs.fetchFlags
    const pollInterval = pollerArgs.pollInterval
    const maxAttempts = pollerArgs.maxAttempts
    fetchFlags.mockImplementation(() => {
      return Promise.resolve(new Error('Fetch flags Error'))
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

    expect(fetchFlags).toHaveBeenCalledTimes(5)
    expect(testArgs.logSpy).toHaveBeenCalledTimes(5)
  })

  it('should successfully fetch flags without retrying on success', async () => {
    const { poller, pollerArgs } = getPoller()
    const fetchFlags = pollerArgs.fetchFlags
    const pollInterval = pollerArgs.pollInterval
    const testArgs = getTestArgs()

    fetchFlags.mockResolvedValue(null)


    poller.start()
    jest.advanceTimersByTime(pollInterval)
    await Promise.resolve()

    expect(fetchFlags).toHaveBeenCalledTimes(1)
    expect(testArgs.logSpy).toHaveBeenCalled()
  })
})
