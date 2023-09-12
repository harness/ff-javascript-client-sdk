import type { Options } from './types'

export default class Poller {
  private timeoutId: number
  private maxAttempts: number = 5

  constructor(
    private fetchFlagsFn: () => Promise<any>,
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

