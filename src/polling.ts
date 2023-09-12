import { logError, MIN_POLLING_INTERVAL } from './utils'
import type { Options } from './types'

// Polling.ts

export default class Poller {
  private timeoutId: number;

  constructor(
      private interval: number,
      private fetchFlagsFn: () => Promise<any | undefined>,
      private configurations: Options,
      private maxAttempts: number = 5 
  ) {}

  public async start(): Promise<void> {
    const logDebug = (message: string, ...args: any[]) => {
      if (this.configurations.debug) {
        console.debug(`[FF-SDK] ${message}`, ...args);
      }
    }

    for (let i = 0; i <= this.maxAttempts; i++) {
      const error = await this.fetchFlagsFn();

      if (error) {
        logDebug('Error when polling for flag updates', error);

        // If max retries haven't been reached, log and try again
        if (i < this.maxAttempts) {
          logDebug(`Retrying... Attempts left: ${this.maxAttempts - i}`);
        } else {
          logDebug('Max attempts reached. Will try again after the interval.');
          break;
        }
      } else {
        logDebug('Successfully polled for flag updates');
        break;
      }
    }

    // Wait for the desired interval before the next poll
    this.timeoutId = window.setTimeout(() => this.start(), this.interval);
  }

  public stop(): void {
    if (this.timeoutId !== undefined) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
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
