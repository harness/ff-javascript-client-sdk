import Poller from '../poller'

jest.useFakeTimers()

describe('Poller', () => {
  let fetchFlagsFn: jest.Mock
  let configurations: any
  let pollInterval: number
  let maxAttempts: number

  beforeEach(() => {
    configurations = {}
    fetchFlagsFn = jest.fn()
    pollInterval = 3000
    maxAttempts = 5
  })

  it('should not start polling if it is already polling', () => {
    const poller = new Poller(fetchFlagsFn, configurations, pollInterval, maxAttempts)
    const logSpy = jest.spyOn(poller as any, 'logDebug')

    poller.start()
    poller.start()

    expect(logSpy).toHaveBeenCalledWith(
      'Polling was requested but is already running - only one poller can run at a time.'
    )
  })

  it('should retry fetching if there is an error', async () => {
    fetchFlagsFn.mockResolvedValue(new Error('Fetch Error'))
    const poller = new Poller(fetchFlagsFn, configurations, pollInterval, maxAttempts)
    const logSpy = jest.spyOn(poller as any, 'logDebug')

    poller.start()
    jest.advanceTimersByTime(maxAttempts * pollInterval)
    await Promise.resolve()
    expect(fetchFlagsFn).toHaveBeenCalledTimes(2)
    expect(logSpy).toHaveBeenCalledWith('Error when polling for flag updates', expect.any(Error))
    // expect(logSpy).toHaveBeenCalledWith(`Maximum attempts reached for polling for flags. Next poll in ${pollInterval}ms.`);
  })

  it('should not retry after max attempts are exceeded', async () => {
    fetchFlagsFn.mockImplementation(() => {
      return Promise.resolve(new Error('Fetch flags Error'))
    })
    const poller = new Poller(fetchFlagsFn, configurations, pollInterval, maxAttempts)
    const logSpy = jest.spyOn(poller as any, 'logDebug')

    poller.start()

    for (let i = 0; i < 5; i++) {
      await Promise.resolve()
    }
    await Promise.resolve()
    expect(fetchFlagsFn).toHaveBeenCalledTimes(5)
    expect(logSpy).toHaveBeenCalledWith('Error when polling for flag updates', expect.any(Error))
    expect(logSpy).toHaveBeenCalledWith(
      `Maximum attempts reached for polling for flags. Next poll in ${pollInterval}ms.`
    )
  })

  it('should successfully fetch flags without retrying on success', async () => {
    fetchFlagsFn.mockResolvedValue(null)
    const poller = new Poller(fetchFlagsFn, configurations, pollInterval, maxAttempts)
    const logSpy = jest.spyOn(poller as any, 'logDebug')

    poller.start()
    jest.advanceTimersByTime(pollInterval) // Simulate time for one poll
    await Promise.resolve() // Ensure promise has resolved

    expect(fetchFlagsFn).toHaveBeenCalledTimes(1)
    expect(logSpy).toHaveBeenCalledWith('Successfully polled for flag updates')
  })
})
