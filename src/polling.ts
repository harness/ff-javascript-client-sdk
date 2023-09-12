import { logError, MIN_POLLING_INTERVAL } from './utils'
import type { Options } from './types'

export default class Poller {
  private timeoutId: number
  private maxAttempts: number = 5

  constructor(
    private fetchFlagsFn: () => Promise<any | undefined>,
    private configurations: Options,
    private pollInterval: number
  ) {}

  public start(): void {
    this.attemptFetch().finally(() => {
      this.timeoutId = window.setTimeout(() => this.start(), this.pollInterval)
    })
  }

  private async attemptFetch(retries: number = 0): Promise<void> {
    const error = await this.fetchFlagsFn()

    if (!error) {
      this.logDebug('Successfully polled for flag updates')
      return
    }

    this.logDebug('Error when polling for flag updates', error)
    if (retries < this.maxAttempts) {
      this.logDebug(`Retrying... Attempts left: ${this.maxAttempts - retries}`)
      await this.attemptFetch(retries + 1)
    } else {
      this.logDebug(`Max retries reached. Will poll again in next interval: ${this.pollInterval}`)
    }
  }

  public stop(): void {
    if (this.timeoutId !== undefined) {
      window.clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
  }

  private logDebug(message: string, ...args: any[]): void {
    if (this.configurations.debug) {
      console.debug(`[FF-SDK] ${message}`, ...args)
    }
  }
}

// const startPollingInterval = () => {
//     if (configurations.pollingInterval < MIN_POLLING_INTERVAL) {
//         configurations.pollingInterval = MIN_POLLING_INTERVAL
//     }
//
//     logDebug("starting poll interval")
//     // TODO - do we need to check if pollInterID is already set? I don't think so, as when polling is stopped, we can
//     //  clear it then.
//     pollIntervalID = window.setInterval(poll, configurations.pollingInterval);
// }
//
// const stopPollingInterval = () => {
//     if (!pollIntervalID) {
//         logError("Attempted to stop polling but no interval ID")
//         return
//     }
//     clearInterval(pollIntervalID);
// }
//
// const poll = () => {
//
// }
