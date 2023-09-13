import type { Options } from './types'

export default class Poller {
  private timeoutId: number

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

    this.attemptFetch().finally(() => {
      this.timeoutId = window.setTimeout(() => this.start(), this.pollInterval)
    })
  }

  private async attemptFetch(): Promise<void> {
    for (let i = 1; i < this.maxAttempts; i++) {
      const error = await this.fetchFlagsFn()

      if (!error) {
        this.logDebug('Successfully polled for flag updates')
        return
      }

      this.logDebug('Error when polling for flag updates', error)

      // Retry fetching flags of flags
      if (i < this.maxAttempts) {
        this.logDebug(`Polling for flags attempt #${i} failed. Remaining attempts: ${this.maxAttempts - i}.`)
      } else {
        this.logDebug(`Maximum attempts reached for polling for flags. Next poll in ${this.pollInterval}ms.`)
      }
    }
  }

  public stop(): void {
    if (this.timeoutId !== undefined) {
      window.clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
  }

  public isPolling(): boolean {
    return this.timeoutId !== undefined
  }

  private logDebug(message: string, ...args: any[]): void {
    if (this.configurations.debug) {
      console.debug(`[FF-SDK] Poller: ${message}`, ...args)
    }
  }
}
