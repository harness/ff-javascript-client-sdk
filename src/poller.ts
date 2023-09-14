import type { Options } from './types'

export default class Poller {
  private timeoutId: number
  private isRunning: boolean

  constructor(
    private fetchFlagsFn: () => Promise<any>,
    private configurations: Options,
    private pollInterval: number,
    private maxAttempts: number
  ) {}

  public start(): void {
    if (this.isPolling()) {
      this.logDebug('Polling was requested but is already running - only one poller can run at a time.')
      return
    }

    this.isRunning = true

    // Don't start polling immediately as we have alreadu fetched flags on client initialization
    window.setTimeout(() => this.poll(), this.configurations.pollingInterval)
  }

  private poll(): void {
    this.attemptFetch().finally(() => {
      this.timeoutId = window.setTimeout(() => this.poll(), this.configurations.pollingInterval)
    })
  }

  private async attemptFetch(): Promise<void> {
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      const error = await this.fetchFlagsFn()

      if (!error) {
        this.logDebug('Successfully polled for flag updates')
        return
      }

      this.logDebug('Error when polling for flag updates', error)

      // Retry fetching flags
      if (attempt < this.maxAttempts) {
        this.logDebug(`Polling for flags attempt #${attempt} failed. Remaining attempts: ${this.maxAttempts - attempt}.`)
      } else {
        this.logDebug(`Maximum attempts reached for polling for flags. Next poll in ${this.pollInterval}ms.`)
      }
    }
  }

  public stop(): void {
    if (this.timeoutId !== undefined) {
      window.clearTimeout(this.timeoutId)
      this.timeoutId = undefined
      this.isRunning = false
    }
  }

  public isPolling(): boolean {
    return this.isRunning
  }

  private logDebug(message: string, ...args: any[]): void {
    if (this.configurations.debug) {
      console.debug(`[FF-SDK] Poller: ${message}`, ...args)
    }
  }
}
