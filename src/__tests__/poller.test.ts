import Poller from '../poller'
import type { Options } from '../types'
import {getRandom} from "../utils";

jest.useFakeTimers()

jest.mock('../utils.ts', () => ({
  getRandom: jest.fn()
}))

interface PollerArgs {
  fetchFlags: jest.MockedFunction<() => Promise<any>>;
  configurations: Partial<Options>
  pollInterval: number
  maxAttempts: number
}

const getPoller = (overrides: Partial<PollerArgs> = {}): { poller: Poller; pollerArgs: PollerArgs } => {
  const args: PollerArgs = {
    fetchFlags: jest.fn(),
    configurations: {},
    pollInterval: 60000,
    maxAttempts: 5,
    ...overrides
  }

  return {
    poller: new Poller(args.fetchFlags, args.configurations, args.pollInterval),
    pollerArgs: args
  }
}

describe('Poller', () => {
  it('should not start polling if it is already polling', () => {
    const { poller } = getPoller()
    const logSpy = jest.spyOn(poller as any, 'logDebug')

    poller.start()
    poller.start()

    expect(logSpy).toHaveBeenCalledWith(
      'Polling was requested but is already running - only one poller can run at a time.'
    )
  })

  it('should retry fetching if there is an error', async () => {
    const { poller, pollerArgs } = getPoller()
    const fetchFlags = pollerArgs.fetchFlags
    fetchFlags.mockResolvedValue(new Error('Fetch Error'))

    const logSpy = jest.spyOn(poller as any, 'logDebug')

    poller.start()
    jest.advanceTimersByTime(pollerArgs.maxAttempts * pollerArgs.pollInterval)
    await Promise.resolve()

    expect(fetchFlags).toHaveBeenCalledTimes(2)
    expect(logSpy).toHaveBeenCalledWith('Error when polling for flag updates', expect.any(Error))
  })

  it('should not retry after max attempts are exceeded', async () => {

    const { poller, pollerArgs } = getPoller()
    const fetchFlags = pollerArgs.fetchFlags
    const pollInterval = pollerArgs.pollInterval
    const maxAttempts = pollerArgs.maxAttempts
    fetchFlags.mockImplementation(() => {
      return Promise.resolve(new Error('Fetch flags Error'))
    })

    const attemptDelay = 5000;
    (getRandom as jest.Mock).mockReturnValue(attemptDelay)



    const logSpy = jest.spyOn(poller as any, 'logDebug')

    poller.start()

    jest.advanceTimersByTime(pollInterval)

    for (let i = 0; i < maxAttempts; i++) {
      jest.advanceTimersByTime(attemptDelay)
      // We need to wait for the fetchFlags promise and the timeout promise to resolve
      await Promise.resolve()
      await Promise.resolve()

    }

    expect(fetchFlags).toHaveBeenCalledTimes(5)
    expect(logSpy).toHaveBeenCalledWith('Error when polling for flag updates', expect.any(Error))
    expect(logSpy).toHaveBeenCalledWith(
      `Maximum attempts reached for polling for flags. Next poll in ${pollInterval}ms.`
    )
  })

  it('should successfully fetch flags without retrying on success', async () => {
    const { poller, pollerArgs } = getPoller()
    const fetchFlags = pollerArgs.fetchFlags
    const pollInterval = pollerArgs.pollInterval

    fetchFlags.mockResolvedValue(null)

    const logSpy = jest.spyOn(poller as any, 'logDebug')

    poller.start()
    jest.advanceTimersByTime(pollInterval)
    await Promise.resolve()

    expect(fetchFlags).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenCalledWith('Successfully polled for flag updates')
  })
})
