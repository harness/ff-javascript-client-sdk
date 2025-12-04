import { APIRequestMiddleware, Event, type Options, StreamEvent } from './types'
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
  private reconnectAttempts = 0
  private retriesExhausted: boolean = false

  constructor(
    private eventBus: Emitter,
    private configurations: Options,
    private url: string,
    private apiKey: string,
    private standardHeaders: Record<string, string>,
    private fallbackPoller: Poller,
    private logDebug: (...data: any[]) => void,
    private logError: (...data: any[]) => void,
    private eventCallback: (e: StreamEvent) => void,
    private maxRetries: number,
    private middleware?: APIRequestMiddleware
  ) {}

  registerAPIRequestMiddleware(middleware: APIRequestMiddleware): void {
    this.middleware = middleware
  };

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
      this.reconnectAttempts = 0
    }

    const onDisconnect = () => {
      clearInterval(this.readTimeoutCheckerId)
      const reconnectDelayMs = getRandom(1000, 30000)
      this.reconnectAttempts++
      this.logDebugMessage('Stream disconnected, will reconnect in ' + reconnectDelayMs + 'ms')
      if (!this.disconnectEventEmitted) {
        this.eventBus.emit(Event.DISCONNECTED)
        this.disconnectEventEmitted = true
      }

      if (this.reconnectAttempts >= 5 && this.reconnectAttempts % 5 === 0) {
        this.logErrorMessage(
          `Reconnection failed after ${this.reconnectAttempts} attempts; attempting further reconnections.`
        )
      }

      if (this.reconnectAttempts >= this.maxRetries) {
        this.retriesExhausted = true
        if (this.configurations.pollingEnabled) {
          this.logErrorMessage('Max streaming retries reached. Staying in polling mode.')
        } else {
          this.logErrorMessage(
            'Max streaming retries reached. Polling mode is disabled and will receive no further flag updates until SDK client is restarted.'
          )
        }
        return
      }

      setTimeout(() => this.start(), reconnectDelayMs)
    }

    const onFailed = (msg: string) => {
      if (this.retriesExhausted) {
        return
      }

      if (!!msg) {
        this.logDebugMessage('Stream has issue', msg)
      }

      // Fallback to polling while we have a stream failure
      this.fallBackToPolling()

      this.eventBus.emit(Event.ERROR_STREAM, msg)
      this.eventBus.emit(Event.ERROR, msg)
      onDisconnect()
    }

    let sseHeaders: Record<string, string> = {
      'Cache-Control': 'no-cache',
      Accept: 'text/event-stream',
      'API-Key': this.apiKey,
      ...this.standardHeaders
    }

    if (this.middleware) {
      const [url, options] = this.middleware([this.url, { headers: sseHeaders }])
      this.url = url as string
      sseHeaders = options?.headers as Record<string, string> || {}
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

    // XMLHttpRequest fires `onload` when a request completes successfully, meaning the entire content has been downloaded.
    // For SSE, if it fires it indicates an invalid state and we should reconnect
    this.xhr.onload = () => {
      onFailed(`Received XMLHttpRequest onLoad event: ${this.xhr.status}`)
      return
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
        this.logDebugMessage('SSE read timeout')
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
