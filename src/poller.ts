import type { Options } from './types'
import { getRandom } from './utils'
import { Event, FetchFlagsResult } from './types'
import type { Emitter } from 'mitt'

export default class Poller {
  private timeoutId: any
  private isRunning: boolean
  private maxAttempts = 5

  constructor(
    private fetchFlagsFn: () => Promise<FetchFlagsResult>,
    private configurations: Options,
    private eventBus: Emitter, // Used to emit the updates retrieved in polling intervals
    private logDebug: (...data: any[]) => void,
    private logError: (...data: any[]) => void
  ) {}

  public start(): void {
    if (this.isPolling()) {
      this.logDebugMessage('Already polling.')
      return
    }

    this.isRunning = true
    this.eventBus.emit(Event.POLLING)

    this.logDebugMessage(`Starting poller, first poll will be in ${this.configurations.pollingInterval}ms`)

    // Don't start polling immediately as we have already fetched flags on client initialization
    this.timeoutId = setTimeout(() => this.poll(), this.configurations.pollingInterval)
  }

  private poll(): void {
    if (!this.isRunning) return
    this.attemptFetch().finally(() => {
      // Check if poller is still running before setting the next timeout
      if (this.isRunning) {
        this.timeoutId = setTimeout(() => this.poll(), this.configurations.pollingInterval)
      }
    })
  }

  private async attemptFetch(): Promise<void> {
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      const result = await this.fetchFlagsFn()

      if (result.type === 'success') {
        this.logDebugMessage(
          `Successfully polled for flag updates, next poll in ${this.configurations.pollingInterval}ms. `
        )
        return
      }

      this.logErrorMessage('Error when polling for flag updates', result.error)

      // Retry fetching flags
      if (attempt >= this.maxAttempts) {
        this.logDebugMessage(
          `Maximum attempts reached for polling for flags. Next poll in ${this.configurations.pollingInterval}ms.`
        )
        return
      }

      this.logDebugMessage(
        `Polling for flags attempt #${attempt} failed. Remaining attempts: ${this.maxAttempts - attempt}`,
        result.error
      )

      const delay = getRandom(1000, 10000)
      await new Promise(res => setTimeout(res, delay))
    }
  }

  public stop(): void {
    if (this.timeoutId) {
      this.isRunning = false
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
      this.eventBus.emit(Event.POLLING_STOPPED)
      this.logDebugMessage('Polling stopped')
    }
  }

  public isPolling(): boolean {
    return this.isRunning
  }

  private logDebugMessage(message: string, ...args: unknown[]): void {
    if (this.configurations.debug) {
      this.logDebug(`Poller: ${message}`, ...args)
    }
  }

  private logErrorMessage(message: string, ...args: unknown[]): void {
    this.logError(`Poller: ${message}`, ...args)
  }
}
