import type { Options } from './types'
import { getRandom, logError } from './utils'
import {Event, FetchFlagsResult} from './types'

export default class Poller {
  private timeoutId: any
  private isRunning: boolean
  private maxAttempts = 5

  constructor(
    private fetchFlagsFn: () => Promise<FetchFlagsResult>,
    private configurations: Options,
    private eventBus: any,
    // Used to emit the updates retrieved in polling intervals
    private storage: Record<string, any>
  ) {}

  public start(): void {
    if (this.isPolling()) {
      this.logDebug('Already polling.')
      return
    }

    this.isRunning = true
    this.eventBus.emit(Event.POLLING)

    this.logDebug(`Starting poller, first poll will be in ${this.configurations.pollingInterval}ms`)
    // Don't start polling immediately as we have already fetched flags on client initialization
    // TODO UNCOMMENT THIS!!!!!!!!
    this.timeoutId = setTimeout(() => this.poll(), this.configurations.pollingInterval)
  }

  private poll(): void {
    this.attemptFetch().finally(() => {
      this.timeoutId = setTimeout(() => this.poll(), this.configurations.pollingInterval)
    })
  }

  private async attemptFetch(): Promise<void> {
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      const result = await this.fetchFlagsFn()

      if (result.type === 'success') {
        this.logDebug(`Successfully polled for flag updates, next poll in ${this.configurations.pollingInterval}ms. `)
        this.eventBus.emit(Event.POLLING_CHANGED, this.storage)
        return
      }

      logError('Error when polling for flag updates', result.error)

      // Retry fetching flags
      if (attempt >= this.maxAttempts) {
        this.logDebug(
          `Maximum attempts reached for polling for flags. Next poll in ${this.configurations.pollingInterval}ms.`
        )
        return
      }

      this.logDebug(
        `Polling for flags attempt #${attempt} failed. Remaining attempts: ${this.maxAttempts - attempt}`,
        result.error
      )

      const delay = getRandom(1000, 10000)
      await new Promise(res => setTimeout(res, delay))
    }
  }

  public stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
      this.isRunning = false
      this.eventBus.emit(Event.POLLING_STOPPED)
      this.logDebug('Polling stopped')
    }
  }

  public isPolling(): boolean {
    return this.isRunning
  }

  private logDebug(message: string, ...args: unknown[]): void {
    if (this.configurations.debug) {
      console.debug(`[FF-SDK] Poller: ${message}`, ...args)
    }
  }
}
