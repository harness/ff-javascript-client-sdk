import {logError, MIN_POLLING_INTERVAL} from "./utils";


// Polling.ts

export default class Polling {
    private intterval
    private intervalId?: number;
    private readonly intervalTime: number;
    private readonly callback: () => void;

    constructor(callback: () => void, intervalTime = 60000) {
        this.callback = callback;
        this.intervalTime = intervalTime;
    }

    // Start the polling process
    public start(): void {
        if (this.intervalId) {
            logError("Attempted to start polling interval ID exists")
            this.intervalId = window.setInterval(this.callback, this.intervalTime);
        }
    }

    // Stop the polling process
    public stop(): void {
        if (!this.intervalId) {
            logError("Attempted to stop polling but no interval ID")
            return
        }
        window.clearInterval(this.intervalId);
        this.intervalId = undefined;
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

