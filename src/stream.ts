import {Evaluation, Event, StreamEvent} from "./types";
import {logError} from "./utils";

const SSE_TIMEOUT_MS = 30000;

export const streamer = (eventBus, configurations, url, apiKey, standardHeaders, eventCallback) => {

    const logDebug = (message: string, ...args: any[]) => {
        if (configurations.debug) {
            console.debug(`[FF-SDK] ${message}`, ...args)
        }
    }

    // TODO: Implement polling when stream is disabled
    if (!configurations.streamEnabled) {
        logDebug('Stream is disabled by configuration. Note: Polling is not yet supported')
        return
    }

    const processData = (data: any): void => {
        data.toString().split(/\r?\n/).forEach(processLine);
    }

    const processLine = (line: string): void => {
        if (line.startsWith('data:')) {
            const event: StreamEvent = JSON.parse(line.substring(5))
            logDebug('Received event from stream: ', event)
            eventCallback(event)
        }
    }

    const getRandom = (min, max) => {
        return Math.round(Math.random() * (max - min) + min)
    }

    const onConnected = () => {
        logDebug('Stream connected')
        eventBus.emit(Event.CONNECTED)
    };

    const onDisconnect = () => {
        clearInterval(readTimeoutCheckerId)
        const reconnectDelayMs = getRandom(1000, 10000)
        logDebug('Stream disconnected, will reconnect in ' + reconnectDelayMs + 'ms')
        eventBus.emit(Event.DISCONNECTED)
        setTimeout(() => streamer(eventBus, configurations, url, apiKey, standardHeaders, eventCallback), reconnectDelayMs)
    };

    const onFailed = (msg: string) => {
        if (!!msg) {
            logError('Stream has issue', msg)
        }
        eventBus.emit(Event.ERROR_STREAM, msg)
        eventBus.emit(Event.ERROR, msg)
        onDisconnect()
    }

    const sseHeaders: Record<string, string> = {
        'Cache-Control': 'no-cache',
        'Accept': 'text/event-stream',
        'API-Key': apiKey,
        ...standardHeaders
    }

    logDebug('SSE HTTP start request', url);

    const xhr = new XMLHttpRequest();
    xhr.open("GET", url)
    for (const [header, value] of Object.entries(sseHeaders)) {
        xhr.setRequestHeader(header, value)
    }
    xhr.timeout = 24 * 60 * 60 * 1000 // Force SSE to reconnect after 24hrs
    xhr.onerror = () => {
        onFailed('XMLHttpRequest error on SSE stream');
    }
    xhr.onabort = () => {
        logDebug('SSE aborted');
        onFailed(null);
    }
    xhr.ontimeout = () => {
        onFailed('SSE timeout');
    }
    xhr.onload = () => {
        if (xhr.status >= 400 && xhr.status <= 599) {
            onFailed(`HTTP code ${xhr.status}`);
            return;
        }
        onConnected();
    }

    let offset = 0;
    let lastActivity = Date.now()

    xhr.onprogress = (event) => {
        lastActivity = Date.now()
        const data = xhr.responseText.slice(offset);
        offset += data.length;
        logDebug("SSE GOT: " + data)
        processData(data);
    }

    const readTimeoutCheckerId = setInterval(() => {
        // this task will kill and restart the SSE connection if no data or heartbeat has arrived in a while
        if (lastActivity < Date.now() - SSE_TIMEOUT_MS) {
            logError("SSE read timeout")
            xhr.abort()
        }
    }, SSE_TIMEOUT_MS)

    xhr.send()
}
