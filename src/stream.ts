import { Event, type Options, StreamEvent } from './types'
import { getRandom } from './utils'
import type Poller from './poller'
import type { Emitter } from 'mitt'

const SSE_TIMEOUT_MS = 30000

export class Streamer {
  private xhr: XMLHttpRequest
  private closed: boolean = false
  private readTimeoutCheckerId: any
  private connectionOpened = false
  private disconnectEventEmitted = false

  constructor(
    private eventBus: Emitter,
    private configurations: Options,
    private url: string,
    private apiKey: string,
    private standardHeaders: Record<string, string>,
    private fallbackPoller: Poller,
    private logDebug: (...data: any[]) => void,
    private logError: (...data: any[]) => void,
    private eventCallback: (e: StreamEvent) => void
  ) {}

  start() {
    const processData = (data: any): void => {
      data.toString().split(/\r?\n/).forEach(processLine)
    }

    const processLine = (line: string): void => {
      if (line.startsWith('data:')) {
        const event: StreamEvent = JSON.parse(line.substring(5))
        this.logDebugMessage('Received event from stream: ', event)
        this.eventCallback(event)
      }
    }

    const onConnected = () => {
      this.logDebugMessage('Stream connected')
      this.eventBus.emit(Event.CONNECTED)
    }

    const onDisconnect = () => {
      clearInterval(this.readTimeoutCheckerId)
      const reconnectDelayMs = getRandom(1000, 10000)
      this.logDebugMessage('Stream disconnected, will reconnect in ' + reconnectDelayMs + 'ms')
      if (!this.disconnectEventEmitted) {
        this.eventBus.emit(Event.DISCONNECTED)
        this.disconnectEventEmitted = true
      }
      setTimeout(() => this.start(), reconnectDelayMs)
    }

    const onFailed = (msg: string) => {
      if (!!msg) {
        this.logErrorMessage('Stream has issue', msg)
      }

      // Fallback to polling while we have a stream failure
      this.fallBackToPolling()

      this.eventBus.emit(Event.ERROR_STREAM, msg)
      this.eventBus.emit(Event.ERROR, msg)
      onDisconnect()
    }

    const sseHeaders: Record<string, string> = {
      'Cache-Control': 'no-cache',
      Accept: 'text/event-stream',
      'API-Key': this.apiKey,
      ...this.standardHeaders
    }

    this.logDebugMessage('SSE HTTP start request', this.url)

    this.xhr = new XMLHttpRequest()
    this.xhr.open('GET', this.url)
    for (const [header, value] of Object.entries(sseHeaders)) {
      this.xhr.setRequestHeader(header, value)
    }
    this.xhr.timeout = 24 * 60 * 60 * 1000 // Force SSE to reconnect after 24hrs
    this.xhr.onerror = () => {
      this.connectionOpened = false
      onFailed('XMLHttpRequest error on SSE stream')
    }
    this.xhr.onabort = () => {
      this.connectionOpened = false
      this.logDebugMessage('SSE aborted')
      if (!this.closed) {
        onFailed(null)
      }
    }
    this.xhr.ontimeout = () => {
      this.connectionOpened = false
      onFailed('SSE timeout')
    }

    // XMLHttpRequest doesn't fire an `onload` event when used to open an SSE connection, but leaving this listener
    // here, in case there are some edge cases where it's fired and so need to handle the reconnect.
    this.xhr.onload = () => {
      if (this.xhr.status >= 400 && this.xhr.status <= 599) {
        onFailed(`HTTP code ${this.xhr.status}`)
        return
      }

      if (!this.connectionOpened) {
        onConnected()
        this.connectionOpened = true
        this.disconnectEventEmitted = false
      }
    }

    let offset = 0
    let lastActivity = Date.now()

    this.xhr.onprogress = () => {
      // XMLHttpRequest doesn't fire an `onload` event when used to open an SSE connection, so we fire the
      // CONNECTED event here if we haven't already done so per unique connection event.
      if (!this.connectionOpened) {
        onConnected()
        this.connectionOpened = true
        this.disconnectEventEmitted = false
      }
      // if we are in polling mode due to a recovered streaming error, then stop polling
      this.stopFallBackPolling()
      lastActivity = Date.now()
      const data = this.xhr.responseText.slice(offset)
      offset += data.length
      this.logDebugMessage('SSE GOT: ' + data)
      processData(data)
    }

    this.readTimeoutCheckerId = setInterval(() => {
      // this task will kill and restart the SSE connection if no data or heartbeat has arrived in a while
      if (lastActivity < Date.now() - SSE_TIMEOUT_MS) {
        this.logErrorMessage('SSE read timeout')
        this.xhr.abort()
      }
    }, SSE_TIMEOUT_MS)

    this.xhr.send()
  }

  close(): void {
    this.connectionOpened = false
    this.closed = true
    if (this.xhr) {
      this.xhr.abort()
    }
    // Stop the task that listens for heartbeats
    clearInterval(this.readTimeoutCheckerId)

    this.eventBus.emit(Event.STOPPED)
    // if we are still in polling mode when close is called, then stop polling
    this.stopFallBackPolling()
  }

  private fallBackToPolling() {
    if (!this.fallbackPoller.isPolling() && this.configurations.pollingEnabled) {
      this.logDebugMessage('Falling back to polling mode while stream recovers')
      this.fallbackPoller.start()
    }
  }

  private stopFallBackPolling() {
    if (this.fallbackPoller.isPolling()) {
      this.logDebugMessage('Stopping fallback polling mode')
      this.fallbackPoller.stop()
    }
  }

  private logDebugMessage(message: string, ...args: unknown[]): void {
    if (this.configurations.debug) {
      this.logDebug(`Streaming:  ${message}`, ...args)
    }
  }

  private logErrorMessage(message: string, ...args: unknown[]): void {
    this.logError(`Streaming:  ${message}`, ...args)
  }
}
