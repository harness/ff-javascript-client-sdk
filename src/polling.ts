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
      this.logDebug('Polling was requested but is already running - only one poller can run at a time.');
      return;
    }

    this.attemptFetch().finally(() => {
      this.timeoutId = window.setTimeout(() => this.start(), this.pollInterval)
    })
  }

  private async attemptFetch(attempts: number = 0): Promise<void> {
    const error = await this.fetchFlagsFn()

    if (!error) {
      this.logDebug('Successfully polled for flag updates')
      return
    }

    this.logDebug('Error when polling for flag updates', error)
    if (attempts < this.maxAttempts) {
      this.logDebug(`Retrying... Attempts left: ${this.maxAttempts - attempts}`)
      await this.attemptFetch(attempts + 1)
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

  public isPolling(): boolean {
    return this.timeoutId !== undefined;
  }

  private logDebug(message: string, ...args: any[]): void {
    if (this.configurations.debug) {
      console.debug(`[FF-SDK] ${message}`, ...args)
    }
  }
}

