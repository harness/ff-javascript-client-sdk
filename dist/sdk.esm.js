var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __commonJS = (callback, module) => () => {
  if (!module) {
    module = {exports: {}};
    callback(module.exports, module);
  }
  return module.exports;
};
var __exportStar = (target, module, desc) => {
  if (module && typeof module === "object" || typeof module === "function") {
    for (let key of __getOwnPropNames(module))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module) => {
  return __exportStar(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? {get: () => module.default, enumerable: true} : {value: module, enumerable: true})), module);
};

// node_modules/event-source-polyfill/src/eventsource.js
var require_eventsource = __commonJS((exports, module) => {
  /** @license
   * eventsource.js
   * Available under MIT License (MIT)
   * https://github.com/Yaffle/EventSource/
   */
  (function(global2) {
    "use strict";
    var setTimeout2 = global2.setTimeout;
    var clearTimeout2 = global2.clearTimeout;
    var XMLHttpRequest = global2.XMLHttpRequest;
    var XDomainRequest = global2.XDomainRequest;
    var ActiveXObject = global2.ActiveXObject;
    var NativeEventSource = global2.EventSource;
    var document = global2.document;
    var Promise2 = global2.Promise;
    var fetch2 = global2.fetch;
    var Response = global2.Response;
    var TextDecoder = global2.TextDecoder;
    var TextEncoder = global2.TextEncoder;
    var AbortController = global2.AbortController;
    if (typeof window !== "undefined" && !("readyState" in document) && document.body == null) {
      document.readyState = "loading";
      window.addEventListener("load", function(event) {
        document.readyState = "complete";
      }, false);
    }
    if (XMLHttpRequest == null && ActiveXObject != null) {
      XMLHttpRequest = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }
    if (Object.create == void 0) {
      Object.create = function(C) {
        function F() {
        }
        F.prototype = C;
        return new F();
      };
    }
    if (!Date.now) {
      Date.now = function now() {
        return new Date().getTime();
      };
    }
    if (AbortController == void 0) {
      var originalFetch2 = fetch2;
      fetch2 = function(url, options) {
        var signal = options.signal;
        return originalFetch2(url, {headers: options.headers, credentials: options.credentials, cache: options.cache}).then(function(response) {
          var reader = response.body.getReader();
          signal._reader = reader;
          if (signal._aborted) {
            signal._reader.cancel();
          }
          return {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            body: {
              getReader: function() {
                return reader;
              }
            }
          };
        });
      };
      AbortController = function() {
        this.signal = {
          _reader: null,
          _aborted: false
        };
        this.abort = function() {
          if (this.signal._reader != null) {
            this.signal._reader.cancel();
          }
          this.signal._aborted = true;
        };
      };
    }
    function TextDecoderPolyfill() {
      this.bitsNeeded = 0;
      this.codePoint = 0;
    }
    TextDecoderPolyfill.prototype.decode = function(octets) {
      function valid(codePoint2, shift, octetsCount2) {
        if (octetsCount2 === 1) {
          return codePoint2 >= 128 >> shift && codePoint2 << shift <= 2047;
        }
        if (octetsCount2 === 2) {
          return codePoint2 >= 2048 >> shift && codePoint2 << shift <= 55295 || codePoint2 >= 57344 >> shift && codePoint2 << shift <= 65535;
        }
        if (octetsCount2 === 3) {
          return codePoint2 >= 65536 >> shift && codePoint2 << shift <= 1114111;
        }
        throw new Error();
      }
      function octetsCount(bitsNeeded2, codePoint2) {
        if (bitsNeeded2 === 6 * 1) {
          return codePoint2 >> 6 > 15 ? 3 : codePoint2 > 31 ? 2 : 1;
        }
        if (bitsNeeded2 === 6 * 2) {
          return codePoint2 > 15 ? 3 : 2;
        }
        if (bitsNeeded2 === 6 * 3) {
          return 3;
        }
        throw new Error();
      }
      var REPLACER = 65533;
      var string = "";
      var bitsNeeded = this.bitsNeeded;
      var codePoint = this.codePoint;
      for (var i = 0; i < octets.length; i += 1) {
        var octet = octets[i];
        if (bitsNeeded !== 0) {
          if (octet < 128 || octet > 191 || !valid(codePoint << 6 | octet & 63, bitsNeeded - 6, octetsCount(bitsNeeded, codePoint))) {
            bitsNeeded = 0;
            codePoint = REPLACER;
            string += String.fromCharCode(codePoint);
          }
        }
        if (bitsNeeded === 0) {
          if (octet >= 0 && octet <= 127) {
            bitsNeeded = 0;
            codePoint = octet;
          } else if (octet >= 192 && octet <= 223) {
            bitsNeeded = 6 * 1;
            codePoint = octet & 31;
          } else if (octet >= 224 && octet <= 239) {
            bitsNeeded = 6 * 2;
            codePoint = octet & 15;
          } else if (octet >= 240 && octet <= 247) {
            bitsNeeded = 6 * 3;
            codePoint = octet & 7;
          } else {
            bitsNeeded = 0;
            codePoint = REPLACER;
          }
          if (bitsNeeded !== 0 && !valid(codePoint, bitsNeeded, octetsCount(bitsNeeded, codePoint))) {
            bitsNeeded = 0;
            codePoint = REPLACER;
          }
        } else {
          bitsNeeded -= 6;
          codePoint = codePoint << 6 | octet & 63;
        }
        if (bitsNeeded === 0) {
          if (codePoint <= 65535) {
            string += String.fromCharCode(codePoint);
          } else {
            string += String.fromCharCode(55296 + (codePoint - 65535 - 1 >> 10));
            string += String.fromCharCode(56320 + (codePoint - 65535 - 1 & 1023));
          }
        }
      }
      this.bitsNeeded = bitsNeeded;
      this.codePoint = codePoint;
      return string;
    };
    var supportsStreamOption = function() {
      try {
        return new TextDecoder().decode(new TextEncoder().encode("test"), {stream: true}) === "test";
      } catch (error) {
        console.debug("TextDecoder does not support streaming option. Using polyfill instead: " + error);
      }
      return false;
    };
    if (TextDecoder == void 0 || TextEncoder == void 0 || !supportsStreamOption()) {
      TextDecoder = TextDecoderPolyfill;
    }
    var k = function() {
    };
    function XHRWrapper(xhr) {
      this.withCredentials = false;
      this.readyState = 0;
      this.status = 0;
      this.statusText = "";
      this.responseText = "";
      this.onprogress = k;
      this.onload = k;
      this.onerror = k;
      this.onreadystatechange = k;
      this._contentType = "";
      this._xhr = xhr;
      this._sendTimeout = 0;
      this._abort = k;
    }
    XHRWrapper.prototype.open = function(method, url) {
      this._abort(true);
      var that = this;
      var xhr = this._xhr;
      var state = 1;
      var timeout = 0;
      this._abort = function(silent) {
        if (that._sendTimeout !== 0) {
          clearTimeout2(that._sendTimeout);
          that._sendTimeout = 0;
        }
        if (state === 1 || state === 2 || state === 3) {
          state = 4;
          xhr.onload = k;
          xhr.onerror = k;
          xhr.onabort = k;
          xhr.onprogress = k;
          xhr.onreadystatechange = k;
          xhr.abort();
          if (timeout !== 0) {
            clearTimeout2(timeout);
            timeout = 0;
          }
          if (!silent) {
            that.readyState = 4;
            that.onabort(null);
            that.onreadystatechange();
          }
        }
        state = 0;
      };
      var onStart = function() {
        if (state === 1) {
          var status = 0;
          var statusText = "";
          var contentType = void 0;
          if (!("contentType" in xhr)) {
            try {
              status = xhr.status;
              statusText = xhr.statusText;
              contentType = xhr.getResponseHeader("Content-Type");
            } catch (error) {
              status = 0;
              statusText = "";
              contentType = void 0;
            }
          } else {
            status = 200;
            statusText = "OK";
            contentType = xhr.contentType;
          }
          if (status !== 0) {
            state = 2;
            that.readyState = 2;
            that.status = status;
            that.statusText = statusText;
            that._contentType = contentType;
            that.onreadystatechange();
          }
        }
      };
      var onProgress = function() {
        onStart();
        if (state === 2 || state === 3) {
          state = 3;
          var responseText = "";
          try {
            responseText = xhr.responseText;
          } catch (error) {
          }
          that.readyState = 3;
          that.responseText = responseText;
          that.onprogress();
        }
      };
      var onFinish = function(type, event) {
        if (event == null || event.preventDefault == null) {
          event = {
            preventDefault: k
          };
        }
        onProgress();
        if (state === 1 || state === 2 || state === 3) {
          state = 4;
          if (timeout !== 0) {
            clearTimeout2(timeout);
            timeout = 0;
          }
          that.readyState = 4;
          if (type === "load") {
            that.onload(event);
          } else if (type === "error") {
            that.onerror(event);
          } else if (type === "abort") {
            that.onabort(event);
          } else {
            throw new TypeError();
          }
          that.onreadystatechange();
        }
      };
      var onReadyStateChange = function(event) {
        if (xhr != void 0) {
          if (xhr.readyState === 4) {
            if (!("onload" in xhr) || !("onerror" in xhr) || !("onabort" in xhr)) {
              onFinish(xhr.responseText === "" ? "error" : "load", event);
            }
          } else if (xhr.readyState === 3) {
            if (!("onprogress" in xhr)) {
              onProgress();
            }
          } else if (xhr.readyState === 2) {
            onStart();
          }
        }
      };
      var onTimeout = function() {
        timeout = setTimeout2(function() {
          onTimeout();
        }, 500);
        if (xhr.readyState === 3) {
          onProgress();
        }
      };
      if ("onload" in xhr) {
        xhr.onload = function(event) {
          onFinish("load", event);
        };
      }
      if ("onerror" in xhr) {
        xhr.onerror = function(event) {
          onFinish("error", event);
        };
      }
      if ("onabort" in xhr) {
        xhr.onabort = function(event) {
          onFinish("abort", event);
        };
      }
      if ("onprogress" in xhr) {
        xhr.onprogress = onProgress;
      }
      if ("onreadystatechange" in xhr) {
        xhr.onreadystatechange = function(event) {
          onReadyStateChange(event);
        };
      }
      if ("contentType" in xhr || !("ontimeout" in XMLHttpRequest.prototype)) {
        url += (url.indexOf("?") === -1 ? "?" : "&") + "padding=true";
      }
      xhr.open(method, url, true);
      if ("readyState" in xhr) {
        timeout = setTimeout2(function() {
          onTimeout();
        }, 0);
      }
    };
    XHRWrapper.prototype.abort = function() {
      this._abort(false);
    };
    XHRWrapper.prototype.getResponseHeader = function(name) {
      return this._contentType;
    };
    XHRWrapper.prototype.setRequestHeader = function(name, value) {
      var xhr = this._xhr;
      if ("setRequestHeader" in xhr) {
        xhr.setRequestHeader(name, value);
      }
    };
    XHRWrapper.prototype.getAllResponseHeaders = function() {
      return this._xhr.getAllResponseHeaders != void 0 ? this._xhr.getAllResponseHeaders() || "" : "";
    };
    XHRWrapper.prototype.send = function() {
      if ((!("ontimeout" in XMLHttpRequest.prototype) || !("sendAsBinary" in XMLHttpRequest.prototype) && !("mozAnon" in XMLHttpRequest.prototype)) && document != void 0 && document.readyState != void 0 && document.readyState !== "complete") {
        var that = this;
        that._sendTimeout = setTimeout2(function() {
          that._sendTimeout = 0;
          that.send();
        }, 4);
        return;
      }
      var xhr = this._xhr;
      if ("withCredentials" in xhr) {
        xhr.withCredentials = this.withCredentials;
      }
      try {
        xhr.send(void 0);
      } catch (error1) {
        throw error1;
      }
    };
    function toLowerCase(name) {
      return name.replace(/[A-Z]/g, function(c) {
        return String.fromCharCode(c.charCodeAt(0) + 32);
      });
    }
    function HeadersPolyfill(all) {
      var map = Object.create(null);
      var array = all.split("\r\n");
      for (var i = 0; i < array.length; i += 1) {
        var line = array[i];
        var parts = line.split(": ");
        var name = parts.shift();
        var value = parts.join(": ");
        map[toLowerCase(name)] = value;
      }
      this._map = map;
    }
    HeadersPolyfill.prototype.get = function(name) {
      return this._map[toLowerCase(name)];
    };
    if (XMLHttpRequest != null && XMLHttpRequest.HEADERS_RECEIVED == null) {
      XMLHttpRequest.HEADERS_RECEIVED = 2;
    }
    function XHRTransport() {
    }
    XHRTransport.prototype.open = function(xhr, onStartCallback, onProgressCallback, onFinishCallback, url, withCredentials, headers) {
      xhr.open("GET", url);
      var offset = 0;
      xhr.onprogress = function() {
        var responseText = xhr.responseText;
        var chunk = responseText.slice(offset);
        offset += chunk.length;
        onProgressCallback(chunk);
      };
      xhr.onerror = function(event) {
        event.preventDefault();
        onFinishCallback(new Error("NetworkError"));
      };
      xhr.onload = function() {
        onFinishCallback(null);
      };
      xhr.onabort = function() {
        onFinishCallback(null);
      };
      xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
          var status = xhr.status;
          var statusText = xhr.statusText;
          var contentType = xhr.getResponseHeader("Content-Type");
          var headers2 = xhr.getAllResponseHeaders();
          onStartCallback(status, statusText, contentType, new HeadersPolyfill(headers2));
        }
      };
      xhr.withCredentials = withCredentials;
      for (var name in headers) {
        if (Object.prototype.hasOwnProperty.call(headers, name)) {
          xhr.setRequestHeader(name, headers[name]);
        }
      }
      xhr.send();
      return xhr;
    };
    function HeadersWrapper(headers) {
      this._headers = headers;
    }
    HeadersWrapper.prototype.get = function(name) {
      return this._headers.get(name);
    };
    function FetchTransport() {
    }
    FetchTransport.prototype.open = function(xhr, onStartCallback, onProgressCallback, onFinishCallback, url, withCredentials, headers) {
      var reader = null;
      var controller = new AbortController();
      var signal = controller.signal;
      var textDecoder = new TextDecoder();
      fetch2(url, {
        headers,
        credentials: withCredentials ? "include" : "same-origin",
        signal,
        cache: "no-store"
      }).then(function(response) {
        reader = response.body.getReader();
        onStartCallback(response.status, response.statusText, response.headers.get("Content-Type"), new HeadersWrapper(response.headers));
        return new Promise2(function(resolve, reject) {
          var readNextChunk = function() {
            reader.read().then(function(result) {
              if (result.done) {
                resolve(void 0);
              } else {
                var chunk = textDecoder.decode(result.value, {stream: true});
                onProgressCallback(chunk);
                readNextChunk();
              }
            })["catch"](function(error) {
              reject(error);
            });
          };
          readNextChunk();
        });
      })["catch"](function(error) {
        if (error.name === "AbortError") {
          return void 0;
        } else {
          return error;
        }
      }).then(function(error) {
        onFinishCallback(error);
      });
      return {
        abort: function() {
          if (reader != null) {
            reader.cancel();
          }
          controller.abort();
        }
      };
    };
    function EventTarget() {
      this._listeners = Object.create(null);
    }
    function throwError(e2) {
      setTimeout2(function() {
        throw e2;
      }, 0);
    }
    EventTarget.prototype.dispatchEvent = function(event) {
      event.target = this;
      var typeListeners = this._listeners[event.type];
      if (typeListeners != void 0) {
        var length = typeListeners.length;
        for (var i = 0; i < length; i += 1) {
          var listener = typeListeners[i];
          try {
            if (typeof listener.handleEvent === "function") {
              listener.handleEvent(event);
            } else {
              listener.call(this, event);
            }
          } catch (e2) {
            throwError(e2);
          }
        }
      }
    };
    EventTarget.prototype.addEventListener = function(type, listener) {
      type = String(type);
      var listeners = this._listeners;
      var typeListeners = listeners[type];
      if (typeListeners == void 0) {
        typeListeners = [];
        listeners[type] = typeListeners;
      }
      var found = false;
      for (var i = 0; i < typeListeners.length; i += 1) {
        if (typeListeners[i] === listener) {
          found = true;
        }
      }
      if (!found) {
        typeListeners.push(listener);
      }
    };
    EventTarget.prototype.removeEventListener = function(type, listener) {
      type = String(type);
      var listeners = this._listeners;
      var typeListeners = listeners[type];
      if (typeListeners != void 0) {
        var filtered = [];
        for (var i = 0; i < typeListeners.length; i += 1) {
          if (typeListeners[i] !== listener) {
            filtered.push(typeListeners[i]);
          }
        }
        if (filtered.length === 0) {
          delete listeners[type];
        } else {
          listeners[type] = filtered;
        }
      }
    };
    function Event2(type) {
      this.type = type;
      this.target = void 0;
    }
    function MessageEvent(type, options) {
      Event2.call(this, type);
      this.data = options.data;
      this.lastEventId = options.lastEventId;
    }
    MessageEvent.prototype = Object.create(Event2.prototype);
    function ConnectionEvent(type, options) {
      Event2.call(this, type);
      this.status = options.status;
      this.statusText = options.statusText;
      this.headers = options.headers;
    }
    ConnectionEvent.prototype = Object.create(Event2.prototype);
    function ErrorEvent(type, options) {
      Event2.call(this, type);
      this.error = options.error;
    }
    ErrorEvent.prototype = Object.create(Event2.prototype);
    var WAITING = -1;
    var CONNECTING = 0;
    var OPEN = 1;
    var CLOSED = 2;
    var AFTER_CR = -1;
    var FIELD_START = 0;
    var FIELD = 1;
    var VALUE_START = 2;
    var VALUE = 3;
    var contentTypeRegExp = /^text\/event\-stream(;.*)?$/i;
    var MINIMUM_DURATION = 1e3;
    var MAXIMUM_DURATION = 18e6;
    var parseDuration = function(value, def) {
      var n2 = value == null ? def : parseInt(value, 10);
      if (n2 !== n2) {
        n2 = def;
      }
      return clampDuration(n2);
    };
    var clampDuration = function(n2) {
      return Math.min(Math.max(n2, MINIMUM_DURATION), MAXIMUM_DURATION);
    };
    var fire = function(that, f, event) {
      try {
        if (typeof f === "function") {
          f.call(that, event);
        }
      } catch (e2) {
        throwError(e2);
      }
    };
    function EventSourcePolyfill2(url, options) {
      EventTarget.call(this);
      options = options || {};
      this.onopen = void 0;
      this.onmessage = void 0;
      this.onerror = void 0;
      this.url = void 0;
      this.readyState = void 0;
      this.withCredentials = void 0;
      this.headers = void 0;
      this._close = void 0;
      start(this, url, options);
    }
    function getBestXHRTransport() {
      return XMLHttpRequest != void 0 && "withCredentials" in XMLHttpRequest.prototype || XDomainRequest == void 0 ? new XMLHttpRequest() : new XDomainRequest();
    }
    var isFetchSupported = fetch2 != void 0 && Response != void 0 && "body" in Response.prototype;
    function start(es, url, options) {
      url = String(url);
      var withCredentials = Boolean(options.withCredentials);
      var lastEventIdQueryParameterName = options.lastEventIdQueryParameterName || "lastEventId";
      var initialRetry = clampDuration(1e3);
      var heartbeatTimeout = parseDuration(options.heartbeatTimeout, 45e3);
      var lastEventId = "";
      var retry = initialRetry;
      var wasActivity = false;
      var textLength = 0;
      var headers = options.headers || {};
      var TransportOption = options.Transport;
      var xhr = isFetchSupported && TransportOption == void 0 ? void 0 : new XHRWrapper(TransportOption != void 0 ? new TransportOption() : getBestXHRTransport());
      var transport = TransportOption != null && typeof TransportOption !== "string" ? new TransportOption() : xhr == void 0 ? new FetchTransport() : new XHRTransport();
      var abortController = void 0;
      var timeout = 0;
      var currentState = WAITING;
      var dataBuffer = "";
      var lastEventIdBuffer = "";
      var eventTypeBuffer = "";
      var textBuffer = "";
      var state = FIELD_START;
      var fieldStart = 0;
      var valueStart = 0;
      var onStart = function(status, statusText, contentType, headers2) {
        if (currentState === CONNECTING) {
          if (status === 200 && contentType != void 0 && contentTypeRegExp.test(contentType)) {
            currentState = OPEN;
            wasActivity = Date.now();
            retry = initialRetry;
            es.readyState = OPEN;
            var event = new ConnectionEvent("open", {
              status,
              statusText,
              headers: headers2
            });
            es.dispatchEvent(event);
            fire(es, es.onopen, event);
          } else {
            var message = "";
            if (status !== 200) {
              if (statusText) {
                statusText = statusText.replace(/\s+/g, " ");
              }
              message = "EventSource's response has a status " + status + " " + statusText + " that is not 200. Aborting the connection.";
            } else {
              message = "EventSource's response has a Content-Type specifying an unsupported type: " + (contentType == void 0 ? "-" : contentType.replace(/\s+/g, " ")) + ". Aborting the connection.";
            }
            close();
            var event = new ConnectionEvent("error", {
              status,
              statusText,
              headers: headers2
            });
            es.dispatchEvent(event);
            fire(es, es.onerror, event);
            console.error(message);
          }
        }
      };
      var onProgress = function(textChunk) {
        if (currentState === OPEN) {
          var n2 = -1;
          for (var i = 0; i < textChunk.length; i += 1) {
            var c = textChunk.charCodeAt(i);
            if (c === "\n".charCodeAt(0) || c === "\r".charCodeAt(0)) {
              n2 = i;
            }
          }
          var chunk = (n2 !== -1 ? textBuffer : "") + textChunk.slice(0, n2 + 1);
          textBuffer = (n2 === -1 ? textBuffer : "") + textChunk.slice(n2 + 1);
          if (textChunk !== "") {
            wasActivity = Date.now();
            textLength += textChunk.length;
          }
          for (var position = 0; position < chunk.length; position += 1) {
            var c = chunk.charCodeAt(position);
            if (state === AFTER_CR && c === "\n".charCodeAt(0)) {
              state = FIELD_START;
            } else {
              if (state === AFTER_CR) {
                state = FIELD_START;
              }
              if (c === "\r".charCodeAt(0) || c === "\n".charCodeAt(0)) {
                if (state !== FIELD_START) {
                  if (state === FIELD) {
                    valueStart = position + 1;
                  }
                  var field = chunk.slice(fieldStart, valueStart - 1);
                  var value = chunk.slice(valueStart + (valueStart < position && chunk.charCodeAt(valueStart) === " ".charCodeAt(0) ? 1 : 0), position);
                  if (field === "data") {
                    dataBuffer += "\n";
                    dataBuffer += value;
                  } else if (field === "id") {
                    lastEventIdBuffer = value;
                  } else if (field === "event") {
                    eventTypeBuffer = value;
                  } else if (field === "retry") {
                    initialRetry = parseDuration(value, initialRetry);
                    retry = initialRetry;
                  } else if (field === "heartbeatTimeout") {
                    heartbeatTimeout = parseDuration(value, heartbeatTimeout);
                    if (timeout !== 0) {
                      clearTimeout2(timeout);
                      timeout = setTimeout2(function() {
                        onTimeout();
                      }, heartbeatTimeout);
                    }
                  }
                }
                if (state === FIELD_START) {
                  if (dataBuffer !== "") {
                    lastEventId = lastEventIdBuffer;
                    if (eventTypeBuffer === "") {
                      eventTypeBuffer = "message";
                    }
                    var event = new MessageEvent(eventTypeBuffer, {
                      data: dataBuffer.slice(1),
                      lastEventId: lastEventIdBuffer
                    });
                    es.dispatchEvent(event);
                    if (eventTypeBuffer === "open") {
                      fire(es, es.onopen, event);
                    } else if (eventTypeBuffer === "message") {
                      fire(es, es.onmessage, event);
                    } else if (eventTypeBuffer === "error") {
                      fire(es, es.onerror, event);
                    }
                    if (currentState === CLOSED) {
                      return;
                    }
                  }
                  dataBuffer = "";
                  eventTypeBuffer = "";
                }
                state = c === "\r".charCodeAt(0) ? AFTER_CR : FIELD_START;
              } else {
                if (state === FIELD_START) {
                  fieldStart = position;
                  state = FIELD;
                }
                if (state === FIELD) {
                  if (c === ":".charCodeAt(0)) {
                    valueStart = position + 1;
                    state = VALUE_START;
                  }
                } else if (state === VALUE_START) {
                  state = VALUE;
                }
              }
            }
          }
        }
      };
      var onFinish = function(error) {
        if (currentState === OPEN || currentState === CONNECTING) {
          currentState = WAITING;
          if (timeout !== 0) {
            clearTimeout2(timeout);
            timeout = 0;
          }
          timeout = setTimeout2(function() {
            onTimeout();
          }, retry);
          retry = clampDuration(Math.min(initialRetry * 16, retry * 2));
          es.readyState = CONNECTING;
          var event = new ErrorEvent("error", {error});
          es.dispatchEvent(event);
          fire(es, es.onerror, event);
          if (error != void 0) {
            console.error(error);
          }
        }
      };
      var close = function() {
        currentState = CLOSED;
        if (abortController != void 0) {
          abortController.abort();
          abortController = void 0;
        }
        if (timeout !== 0) {
          clearTimeout2(timeout);
          timeout = 0;
        }
        es.readyState = CLOSED;
      };
      var onTimeout = function() {
        timeout = 0;
        if (currentState !== WAITING) {
          if (!wasActivity && abortController != void 0) {
            onFinish(new Error("No activity within " + heartbeatTimeout + " milliseconds. " + (currentState === CONNECTING ? "No response received." : textLength + " chars received.") + " Reconnecting."));
            if (abortController != void 0) {
              abortController.abort();
              abortController = void 0;
            }
          } else {
            var nextHeartbeat = Math.max((wasActivity || Date.now()) + heartbeatTimeout - Date.now(), 1);
            wasActivity = false;
            timeout = setTimeout2(function() {
              onTimeout();
            }, nextHeartbeat);
          }
          return;
        }
        wasActivity = false;
        textLength = 0;
        timeout = setTimeout2(function() {
          onTimeout();
        }, heartbeatTimeout);
        currentState = CONNECTING;
        dataBuffer = "";
        eventTypeBuffer = "";
        lastEventIdBuffer = lastEventId;
        textBuffer = "";
        fieldStart = 0;
        valueStart = 0;
        state = FIELD_START;
        var requestURL = url;
        if (url.slice(0, 5) !== "data:" && url.slice(0, 5) !== "blob:") {
          if (lastEventId !== "") {
            requestURL += (url.indexOf("?") === -1 ? "?" : "&") + lastEventIdQueryParameterName + "=" + encodeURIComponent(lastEventId);
          }
        }
        var withCredentials2 = es.withCredentials;
        var requestHeaders = {};
        requestHeaders["Accept"] = "text/event-stream";
        var headers2 = es.headers;
        if (headers2 != void 0) {
          for (var name in headers2) {
            if (Object.prototype.hasOwnProperty.call(headers2, name)) {
              requestHeaders[name] = headers2[name];
            }
          }
        }
        try {
          abortController = transport.open(xhr, onStart, onProgress, onFinish, requestURL, withCredentials2, requestHeaders);
        } catch (error) {
          close();
          throw error;
        }
      };
      es.url = url;
      es.readyState = CONNECTING;
      es.withCredentials = withCredentials;
      es.headers = headers;
      es._close = close;
      onTimeout();
    }
    EventSourcePolyfill2.prototype = Object.create(EventTarget.prototype);
    EventSourcePolyfill2.prototype.CONNECTING = CONNECTING;
    EventSourcePolyfill2.prototype.OPEN = OPEN;
    EventSourcePolyfill2.prototype.CLOSED = CLOSED;
    EventSourcePolyfill2.prototype.close = function() {
      this._close();
    };
    EventSourcePolyfill2.CONNECTING = CONNECTING;
    EventSourcePolyfill2.OPEN = OPEN;
    EventSourcePolyfill2.CLOSED = CLOSED;
    EventSourcePolyfill2.prototype.withCredentials = void 0;
    var R = NativeEventSource;
    if (XMLHttpRequest != void 0 && (NativeEventSource == void 0 || !("withCredentials" in NativeEventSource.prototype))) {
      R = EventSourcePolyfill2;
    }
    (function(factory) {
      if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(exports);
        if (v !== void 0)
          module.exports = v;
      } else if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
      } else {
        factory(global2);
      }
    })(function(exports2) {
      exports2.EventSourcePolyfill = EventSourcePolyfill2;
      exports2.NativeEventSource = NativeEventSource;
      exports2.EventSource = R;
    });
  })(typeof globalThis === "undefined" ? typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : exports : globalThis);
});

// node_modules/node-fetch/browser.js
var require_browser = __commonJS((exports, module) => {
  "use strict";
  var getGlobal = function() {
    if (typeof self !== "undefined") {
      return self;
    }
    if (typeof window !== "undefined") {
      return window;
    }
    if (typeof global2 !== "undefined") {
      return global2;
    }
    throw new Error("unable to locate global object");
  };
  var global2 = getGlobal();
  module.exports = exports = global2.fetch;
  if (global2.fetch) {
    exports.default = global2.fetch.bind(global2);
  }
  exports.Headers = global2.Headers;
  exports.Request = global2.Request;
  exports.Response = global2.Response;
});

// node_modules/requires-port/index.js
var require_requires_port = __commonJS((exports, module) => {
  "use strict";
  module.exports = function required(port, protocol) {
    protocol = protocol.split(":")[0];
    port = +port;
    if (!port)
      return false;
    switch (protocol) {
      case "http":
      case "ws":
        return port !== 80;
      case "https":
      case "wss":
        return port !== 443;
      case "ftp":
        return port !== 21;
      case "gopher":
        return port !== 70;
      case "file":
        return false;
    }
    return port !== 0;
  };
});

// node_modules/querystringify/index.js
var require_querystringify = __commonJS((exports) => {
  "use strict";
  var has = Object.prototype.hasOwnProperty;
  var undef;
  function decode(input) {
    try {
      return decodeURIComponent(input.replace(/\+/g, " "));
    } catch (e2) {
      return null;
    }
  }
  function encode(input) {
    try {
      return encodeURIComponent(input);
    } catch (e2) {
      return null;
    }
  }
  function querystring(query) {
    var parser = /([^=?#&]+)=?([^&]*)/g, result = {}, part;
    while (part = parser.exec(query)) {
      var key = decode(part[1]), value = decode(part[2]);
      if (key === null || value === null || key in result)
        continue;
      result[key] = value;
    }
    return result;
  }
  function querystringify(obj, prefix) {
    prefix = prefix || "";
    var pairs = [], value, key;
    if (typeof prefix !== "string")
      prefix = "?";
    for (key in obj) {
      if (has.call(obj, key)) {
        value = obj[key];
        if (!value && (value === null || value === undef || isNaN(value))) {
          value = "";
        }
        key = encode(key);
        value = encode(value);
        if (key === null || value === null)
          continue;
        pairs.push(key + "=" + value);
      }
    }
    return pairs.length ? prefix + pairs.join("&") : "";
  }
  exports.stringify = querystringify;
  exports.parse = querystring;
});

// node_modules/url-parse/index.js
var require_url_parse = __commonJS((exports, module) => {
  "use strict";
  var required = require_requires_port();
  var qs = require_querystringify();
  var slashes = /^[A-Za-z][A-Za-z0-9+-.]*:[\\/]+/;
  var protocolre = /^([a-z][a-z0-9.+-]*:)?([\\/]{1,})?([\S\s]*)/i;
  var whitespace = "[\\x09\\x0A\\x0B\\x0C\\x0D\\x20\\xA0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000\\u2028\\u2029\\uFEFF]";
  var left = new RegExp("^" + whitespace + "+");
  function trimLeft(str) {
    return (str ? str : "").toString().replace(left, "");
  }
  var rules = [
    ["#", "hash"],
    ["?", "query"],
    function sanitize(address) {
      return address.replace("\\", "/");
    },
    ["/", "pathname"],
    ["@", "auth", 1],
    [NaN, "host", void 0, 1, 1],
    [/:(\d+)$/, "port", void 0, 1],
    [NaN, "hostname", void 0, 1, 1]
  ];
  var ignore = {hash: 1, query: 1};
  function lolcation(loc) {
    var globalVar;
    if (typeof window !== "undefined")
      globalVar = window;
    else if (typeof global !== "undefined")
      globalVar = global;
    else if (typeof self !== "undefined")
      globalVar = self;
    else
      globalVar = {};
    var location = globalVar.location || {};
    loc = loc || location;
    var finaldestination = {}, type = typeof loc, key;
    if (loc.protocol === "blob:") {
      finaldestination = new Url(unescape(loc.pathname), {});
    } else if (type === "string") {
      finaldestination = new Url(loc, {});
      for (key in ignore)
        delete finaldestination[key];
    } else if (type === "object") {
      for (key in loc) {
        if (key in ignore)
          continue;
        finaldestination[key] = loc[key];
      }
      if (finaldestination.slashes === void 0) {
        finaldestination.slashes = slashes.test(loc.href);
      }
    }
    return finaldestination;
  }
  function extractProtocol(address) {
    address = trimLeft(address);
    var match = protocolre.exec(address), protocol = match[1] ? match[1].toLowerCase() : "", slashes2 = !!(match[2] && match[2].length >= 2), rest = match[2] && match[2].length === 1 ? "/" + match[3] : match[3];
    return {
      protocol,
      slashes: slashes2,
      rest
    };
  }
  function resolve(relative, base) {
    if (relative === "")
      return base;
    var path = (base || "/").split("/").slice(0, -1).concat(relative.split("/")), i = path.length, last = path[i - 1], unshift = false, up = 0;
    while (i--) {
      if (path[i] === ".") {
        path.splice(i, 1);
      } else if (path[i] === "..") {
        path.splice(i, 1);
        up++;
      } else if (up) {
        if (i === 0)
          unshift = true;
        path.splice(i, 1);
        up--;
      }
    }
    if (unshift)
      path.unshift("");
    if (last === "." || last === "..")
      path.push("");
    return path.join("/");
  }
  function Url(address, location, parser) {
    address = trimLeft(address);
    if (!(this instanceof Url)) {
      return new Url(address, location, parser);
    }
    var relative, extracted, parse, instruction, index, key, instructions = rules.slice(), type = typeof location, url = this, i = 0;
    if (type !== "object" && type !== "string") {
      parser = location;
      location = null;
    }
    if (parser && typeof parser !== "function")
      parser = qs.parse;
    location = lolcation(location);
    extracted = extractProtocol(address || "");
    relative = !extracted.protocol && !extracted.slashes;
    url.slashes = extracted.slashes || relative && location.slashes;
    url.protocol = extracted.protocol || location.protocol || "";
    address = extracted.rest;
    if (!extracted.slashes)
      instructions[3] = [/(.*)/, "pathname"];
    for (; i < instructions.length; i++) {
      instruction = instructions[i];
      if (typeof instruction === "function") {
        address = instruction(address);
        continue;
      }
      parse = instruction[0];
      key = instruction[1];
      if (parse !== parse) {
        url[key] = address;
      } else if (typeof parse === "string") {
        if (~(index = address.indexOf(parse))) {
          if (typeof instruction[2] === "number") {
            url[key] = address.slice(0, index);
            address = address.slice(index + instruction[2]);
          } else {
            url[key] = address.slice(index);
            address = address.slice(0, index);
          }
        }
      } else if (index = parse.exec(address)) {
        url[key] = index[1];
        address = address.slice(0, index.index);
      }
      url[key] = url[key] || (relative && instruction[3] ? location[key] || "" : "");
      if (instruction[4])
        url[key] = url[key].toLowerCase();
    }
    if (parser)
      url.query = parser(url.query);
    if (relative && location.slashes && url.pathname.charAt(0) !== "/" && (url.pathname !== "" || location.pathname !== "")) {
      url.pathname = resolve(url.pathname, location.pathname);
    }
    if (url.pathname.charAt(0) !== "/" && url.hostname) {
      url.pathname = "/" + url.pathname;
    }
    if (!required(url.port, url.protocol)) {
      url.host = url.hostname;
      url.port = "";
    }
    url.username = url.password = "";
    if (url.auth) {
      instruction = url.auth.split(":");
      url.username = instruction[0] || "";
      url.password = instruction[1] || "";
    }
    url.origin = url.protocol && url.host && url.protocol !== "file:" ? url.protocol + "//" + url.host : "null";
    url.href = url.toString();
  }
  function set(part, value, fn) {
    var url = this;
    switch (part) {
      case "query":
        if (typeof value === "string" && value.length) {
          value = (fn || qs.parse)(value);
        }
        url[part] = value;
        break;
      case "port":
        url[part] = value;
        if (!required(value, url.protocol)) {
          url.host = url.hostname;
          url[part] = "";
        } else if (value) {
          url.host = url.hostname + ":" + value;
        }
        break;
      case "hostname":
        url[part] = value;
        if (url.port)
          value += ":" + url.port;
        url.host = value;
        break;
      case "host":
        url[part] = value;
        if (/:\d+$/.test(value)) {
          value = value.split(":");
          url.port = value.pop();
          url.hostname = value.join(":");
        } else {
          url.hostname = value;
          url.port = "";
        }
        break;
      case "protocol":
        url.protocol = value.toLowerCase();
        url.slashes = !fn;
        break;
      case "pathname":
      case "hash":
        if (value) {
          var char = part === "pathname" ? "/" : "#";
          url[part] = value.charAt(0) !== char ? char + value : value;
        } else {
          url[part] = value;
        }
        break;
      default:
        url[part] = value;
    }
    for (var i = 0; i < rules.length; i++) {
      var ins = rules[i];
      if (ins[4])
        url[ins[1]] = url[ins[1]].toLowerCase();
    }
    url.origin = url.protocol && url.host && url.protocol !== "file:" ? url.protocol + "//" + url.host : "null";
    url.href = url.toString();
    return url;
  }
  function toString(stringify) {
    if (!stringify || typeof stringify !== "function")
      stringify = qs.stringify;
    var query, url = this, protocol = url.protocol;
    if (protocol && protocol.charAt(protocol.length - 1) !== ":")
      protocol += ":";
    var result = protocol + (url.slashes ? "//" : "");
    if (url.username) {
      result += url.username;
      if (url.password)
        result += ":" + url.password;
      result += "@";
    }
    result += url.host + url.pathname;
    query = typeof url.query === "object" ? stringify(url.query) : url.query;
    if (query)
      result += query.charAt(0) !== "?" ? "?" + query : query;
    if (url.hash)
      result += url.hash;
    return result;
  }
  Url.prototype = {set, toString};
  Url.extractProtocol = extractProtocol;
  Url.location = lolcation;
  Url.trimLeft = trimLeft;
  Url.qs = qs;
  module.exports = Url;
});

// node_modules/original/index.js
var require_original = __commonJS((exports, module) => {
  "use strict";
  var parse = require_url_parse();
  function origin(url) {
    if (typeof url === "string")
      url = parse(url);
    if (!url.protocol || !url.hostname)
      return "null";
    return (url.protocol + "//" + url.host).toLowerCase();
  }
  origin.same = function same(a, b) {
    return origin(a) === origin(b);
  };
  module.exports = origin;
});

// node_modules/eventsource/lib/eventsource.js
var require_eventsource2 = __commonJS((exports, module) => {
  var original = require_original();
  var parse = require("url").parse;
  var events = require("events");
  var https = require("https");
  var http = require("http");
  var util = require("util");
  var httpsOptions = [
    "pfx",
    "key",
    "passphrase",
    "cert",
    "ca",
    "ciphers",
    "rejectUnauthorized",
    "secureProtocol",
    "servername",
    "checkServerIdentity"
  ];
  var bom = [239, 187, 191];
  var colon = 58;
  var space = 32;
  var lineFeed = 10;
  var carriageReturn = 13;
  function hasBom(buf) {
    return bom.every(function(charCode, index) {
      return buf[index] === charCode;
    });
  }
  function EventSource2(url, eventSourceInitDict) {
    var readyState = EventSource2.CONNECTING;
    Object.defineProperty(this, "readyState", {
      get: function() {
        return readyState;
      }
    });
    Object.defineProperty(this, "url", {
      get: function() {
        return url;
      }
    });
    var self2 = this;
    self2.reconnectInterval = 1e3;
    function onConnectionClosed(message) {
      if (readyState === EventSource2.CLOSED)
        return;
      readyState = EventSource2.CONNECTING;
      _emit("error", new Event2("error", {message}));
      if (reconnectUrl) {
        url = reconnectUrl;
        reconnectUrl = null;
      }
      setTimeout(function() {
        if (readyState !== EventSource2.CONNECTING) {
          return;
        }
        connect();
      }, self2.reconnectInterval);
    }
    var req;
    var lastEventId = "";
    if (eventSourceInitDict && eventSourceInitDict.headers && eventSourceInitDict.headers["Last-Event-ID"]) {
      lastEventId = eventSourceInitDict.headers["Last-Event-ID"];
      delete eventSourceInitDict.headers["Last-Event-ID"];
    }
    var discardTrailingNewline = false;
    var data = "";
    var eventName = "";
    var reconnectUrl = null;
    function connect() {
      var options = parse(url);
      var isSecure = options.protocol === "https:";
      options.headers = {"Cache-Control": "no-cache", Accept: "text/event-stream"};
      if (lastEventId)
        options.headers["Last-Event-ID"] = lastEventId;
      if (eventSourceInitDict && eventSourceInitDict.headers) {
        for (var i in eventSourceInitDict.headers) {
          var header = eventSourceInitDict.headers[i];
          if (header) {
            options.headers[i] = header;
          }
        }
      }
      options.rejectUnauthorized = !(eventSourceInitDict && !eventSourceInitDict.rejectUnauthorized);
      var useProxy = eventSourceInitDict && eventSourceInitDict.proxy;
      if (useProxy) {
        var proxy = parse(eventSourceInitDict.proxy);
        isSecure = proxy.protocol === "https:";
        options.protocol = isSecure ? "https:" : "http:";
        options.path = url;
        options.headers.Host = options.host;
        options.hostname = proxy.hostname;
        options.host = proxy.host;
        options.port = proxy.port;
      }
      if (eventSourceInitDict && eventSourceInitDict.https) {
        for (var optName in eventSourceInitDict.https) {
          if (httpsOptions.indexOf(optName) === -1) {
            continue;
          }
          var option = eventSourceInitDict.https[optName];
          if (option !== void 0) {
            options[optName] = option;
          }
        }
      }
      if (eventSourceInitDict && eventSourceInitDict.withCredentials !== void 0) {
        options.withCredentials = eventSourceInitDict.withCredentials;
      }
      req = (isSecure ? https : http).request(options, function(res) {
        if (res.statusCode === 500 || res.statusCode === 502 || res.statusCode === 503 || res.statusCode === 504) {
          _emit("error", new Event2("error", {status: res.statusCode, message: res.statusMessage}));
          onConnectionClosed();
          return;
        }
        if (res.statusCode === 301 || res.statusCode === 307) {
          if (!res.headers.location) {
            _emit("error", new Event2("error", {status: res.statusCode, message: res.statusMessage}));
            return;
          }
          if (res.statusCode === 307)
            reconnectUrl = url;
          url = res.headers.location;
          process.nextTick(connect);
          return;
        }
        if (res.statusCode !== 200) {
          _emit("error", new Event2("error", {status: res.statusCode, message: res.statusMessage}));
          return self2.close();
        }
        readyState = EventSource2.OPEN;
        res.on("close", function() {
          res.removeAllListeners("close");
          res.removeAllListeners("end");
          onConnectionClosed();
        });
        res.on("end", function() {
          res.removeAllListeners("close");
          res.removeAllListeners("end");
          onConnectionClosed();
        });
        _emit("open", new Event2("open"));
        var isFirst = true;
        var buf;
        res.on("data", function(chunk) {
          buf = buf ? Buffer.concat([buf, chunk]) : chunk;
          if (isFirst && hasBom(buf)) {
            buf = buf.slice(bom.length);
          }
          isFirst = false;
          var pos = 0;
          var length = buf.length;
          while (pos < length) {
            if (discardTrailingNewline) {
              if (buf[pos] === lineFeed) {
                ++pos;
              }
              discardTrailingNewline = false;
            }
            var lineLength = -1;
            var fieldLength = -1;
            var c;
            for (var i2 = pos; lineLength < 0 && i2 < length; ++i2) {
              c = buf[i2];
              if (c === colon) {
                if (fieldLength < 0) {
                  fieldLength = i2 - pos;
                }
              } else if (c === carriageReturn) {
                discardTrailingNewline = true;
                lineLength = i2 - pos;
              } else if (c === lineFeed) {
                lineLength = i2 - pos;
              }
            }
            if (lineLength < 0) {
              break;
            }
            parseEventStreamLine(buf, pos, fieldLength, lineLength);
            pos += lineLength + 1;
          }
          if (pos === length) {
            buf = void 0;
          } else if (pos > 0) {
            buf = buf.slice(pos);
          }
        });
      });
      req.on("error", function(err) {
        onConnectionClosed(err.message);
      });
      if (req.setNoDelay)
        req.setNoDelay(true);
      req.end();
    }
    connect();
    function _emit() {
      if (self2.listeners(arguments[0]).length > 0) {
        self2.emit.apply(self2, arguments);
      }
    }
    this._close = function() {
      if (readyState === EventSource2.CLOSED)
        return;
      readyState = EventSource2.CLOSED;
      if (req.abort)
        req.abort();
      if (req.xhr && req.xhr.abort)
        req.xhr.abort();
    };
    function parseEventStreamLine(buf, pos, fieldLength, lineLength) {
      if (lineLength === 0) {
        if (data.length > 0) {
          var type = eventName || "message";
          _emit(type, new MessageEvent(type, {
            data: data.slice(0, -1),
            lastEventId,
            origin: original(url)
          }));
          data = "";
        }
        eventName = void 0;
      } else if (fieldLength > 0) {
        var noValue = fieldLength < 0;
        var step = 0;
        var field = buf.slice(pos, pos + (noValue ? lineLength : fieldLength)).toString();
        if (noValue) {
          step = lineLength;
        } else if (buf[pos + fieldLength + 1] !== space) {
          step = fieldLength + 1;
        } else {
          step = fieldLength + 2;
        }
        pos += step;
        var valueLength = lineLength - step;
        var value = buf.slice(pos, pos + valueLength).toString();
        if (field === "data") {
          data += value + "\n";
        } else if (field === "event") {
          eventName = value;
        } else if (field === "id") {
          lastEventId = value;
        } else if (field === "retry") {
          var retry = parseInt(value, 10);
          if (!Number.isNaN(retry)) {
            self2.reconnectInterval = retry;
          }
        }
      }
    }
  }
  module.exports = EventSource2;
  util.inherits(EventSource2, events.EventEmitter);
  EventSource2.prototype.constructor = EventSource2;
  ["open", "error", "message"].forEach(function(method) {
    Object.defineProperty(EventSource2.prototype, "on" + method, {
      get: function get() {
        var listener = this.listeners(method)[0];
        return listener ? listener._listener ? listener._listener : listener : void 0;
      },
      set: function set(listener) {
        this.removeAllListeners(method);
        this.addEventListener(method, listener);
      }
    });
  });
  Object.defineProperty(EventSource2, "CONNECTING", {enumerable: true, value: 0});
  Object.defineProperty(EventSource2, "OPEN", {enumerable: true, value: 1});
  Object.defineProperty(EventSource2, "CLOSED", {enumerable: true, value: 2});
  EventSource2.prototype.CONNECTING = 0;
  EventSource2.prototype.OPEN = 1;
  EventSource2.prototype.CLOSED = 2;
  EventSource2.prototype.close = function() {
    this._close();
  };
  EventSource2.prototype.addEventListener = function addEventListener(type, listener) {
    if (typeof listener === "function") {
      listener._listener = listener;
      this.on(type, listener);
    }
  };
  EventSource2.prototype.dispatchEvent = function dispatchEvent(event) {
    if (!event.type) {
      throw new Error("UNSPECIFIED_EVENT_TYPE_ERR");
    }
    this.emit(event.type, event.detail);
  };
  EventSource2.prototype.removeEventListener = function removeEventListener(type, listener) {
    if (typeof listener === "function") {
      listener._listener = void 0;
      this.removeListener(type, listener);
    }
  };
  function Event2(type, optionalProperties) {
    Object.defineProperty(this, "type", {writable: false, value: type, enumerable: true});
    if (optionalProperties) {
      for (var f in optionalProperties) {
        if (optionalProperties.hasOwnProperty(f)) {
          Object.defineProperty(this, f, {writable: false, value: optionalProperties[f], enumerable: true});
        }
      }
    }
  }
  function MessageEvent(type, eventInitDict) {
    Object.defineProperty(this, "type", {writable: false, value: type, enumerable: true});
    for (var f in eventInitDict) {
      if (eventInitDict.hasOwnProperty(f)) {
        Object.defineProperty(this, f, {writable: false, value: eventInitDict[f], enumerable: true});
      }
    }
  }
});

// node_modules/jwt-decode/build/jwt-decode.esm.js
function e(e2) {
  this.message = e2;
}
e.prototype = new Error(), e.prototype.name = "InvalidCharacterError";
var r = typeof window != "undefined" && window.atob && window.atob.bind(window) || function(r2) {
  var t2 = String(r2).replace(/=+$/, "");
  if (t2.length % 4 == 1)
    throw new e("'atob' failed: The string to be decoded is not correctly encoded.");
  for (var n2, o2, a = 0, i = 0, c = ""; o2 = t2.charAt(i++); ~o2 && (n2 = a % 4 ? 64 * n2 + o2 : o2, a++ % 4) ? c += String.fromCharCode(255 & n2 >> (-2 * a & 6)) : 0)
    o2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(o2);
  return c;
};
function t(e2) {
  var t2 = e2.replace(/-/g, "+").replace(/_/g, "/");
  switch (t2.length % 4) {
    case 0:
      break;
    case 2:
      t2 += "==";
      break;
    case 3:
      t2 += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }
  try {
    return function(e3) {
      return decodeURIComponent(r(e3).replace(/(.)/g, function(e4, r2) {
        var t3 = r2.charCodeAt(0).toString(16).toUpperCase();
        return t3.length < 2 && (t3 = "0" + t3), "%" + t3;
      }));
    }(t2);
  } catch (e3) {
    return r(t2);
  }
}
function n(e2) {
  this.message = e2;
}
function o(e2, r2) {
  if (typeof e2 != "string")
    throw new n("Invalid token specified");
  var o2 = (r2 = r2 || {}).header === true ? 0 : 1;
  try {
    return JSON.parse(t(e2.split(".")[o2]));
  } catch (e3) {
    throw new n("Invalid token specified: " + e3.message);
  }
}
n.prototype = new Error(), n.prototype.name = "InvalidTokenError";
var jwt_decode_esm_default = o;

// node_modules/mitt/dist/mitt.es.js
function mitt_es_default(n2) {
  return {all: n2 = n2 || new Map(), on: function(t2, e2) {
    var i = n2.get(t2);
    i && i.push(e2) || n2.set(t2, [e2]);
  }, off: function(t2, e2) {
    var i = n2.get(t2);
    i && i.splice(i.indexOf(e2) >>> 0, 1);
  }, emit: function(t2, e2) {
    (n2.get(t2) || []).slice().map(function(n3) {
      n3(e2);
    }), (n2.get("*") || []).slice().map(function(n3) {
      n3(t2, e2);
    });
  }};
}

// src/index.ts
var import_event_source_polyfill = __toModule(require_eventsource());

// src/types.ts
var Event;
(function(Event2) {
  Event2["READY"] = "ready";
  Event2["CONNECTED"] = "connected";
  Event2["DISCONNECTED"] = "disconnected";
  Event2["RECONNECTED"] = "reconnected";
  Event2["CHANGED"] = "changed";
  Event2["ERROR"] = "error";
})(Event || (Event = {}));

// src/utils.ts
var defaultOptions = {
  debug: false,
  baseUrl: "https://config.feature-flags.uat.harness.io/api/1.0",
  eventUrl: "https://event.feature-flags.uat.harness.io/api/1.0",
  streamEnabled: true,
  allAttributesPrivate: false,
  privateAttributeNames: []
};
var logError = (message, ...args) => console.error(`[FF-SDK] ${message}`, ...args);
var METRICS_FLUSH_INTERVAL = 30 * 1e3;

// src/index.ts
var fetch = globalThis.fetch || require_browser();
var EventSource = globalThis.fetch ? import_event_source_polyfill.EventSourcePolyfill : require_eventsource2();
var hasProxy = !!globalThis.Proxy;
var convertValue = (evaluation) => {
  let {value} = evaluation;
  try {
    switch (evaluation.kind.toLowerCase()) {
      case "int":
      case "number":
        value = Number(value);
        break;
      case "boolean":
        value = value.toLocaleString() === "true";
        break;
      case "json":
        value = JSON.parse(value);
        break;
    }
  } catch (error) {
    logError(error);
  }
  return value;
};
var initialize = (apiKey, target, options) => {
  let environment;
  let eventSource;
  let jwtToken;
  let metricsSchedulerId;
  let metrics = [];
  const eventBus = mitt_es_default();
  const configurations = {...defaultOptions, ...options};
  const logDebug = (message, ...args) => {
    if (configurations.debug) {
      console.debug(`[FF-SDK] ${message}`, ...args);
    }
  };
  globalThis.onbeforeunload = () => {
    if (metrics.length && globalThis.localStorage) {
      globalThis.localStorage.HARNESS_FF_METRICS = JSON.stringify(metrics);
    }
  };
  const authenticate = async (clientID, configuration) => {
    const response = await fetch(`${configuration.baseUrl}/client/auth`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({apiKey: clientID, target})
    });
    const data = await response.json();
    return data.authToken;
  };
  const scheduleSendingMetrics = () => {
    if (metrics.length) {
      logDebug("Sending metrics...", metrics);
      const payload = {
        metricsData: metrics.map((entry) => ({
          timestamp: Date.now(),
          count: entry.count,
          metricsType: "FFMETRICS",
          attributes: [
            {
              key: "featureIdentifier",
              value: entry.featureIdentifier
            },
            {
              key: "featureName",
              value: entry.featureIdentifier
            },
            {
              key: "featureValue",
              value: String(entry.featureValue)
            },
            {
              key: "target",
              value: target.identifier
            },
            {
              key: "SDK_NAME",
              value: "JavaScript"
            },
            {
              key: "SDK_TYPE",
              value: "client"
            }
          ]
        }))
      };
      fetch(`${options.eventUrl}/metrics/${environment}`, {
        method: "POST",
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${jwtToken}`},
        body: JSON.stringify(payload)
      }).then(() => {
        metrics = [];
      }).catch((error) => {
        logError(error);
      }).finally(() => {
        metricsSchedulerId = setTimeout(scheduleSendingMetrics, METRICS_FLUSH_INTERVAL);
      });
    } else {
      metricsSchedulerId = setTimeout(scheduleSendingMetrics, METRICS_FLUSH_INTERVAL);
    }
  };
  const creatStorage = function() {
    return hasProxy ? new Proxy({}, {
      get(target2, featureIdentifier) {
        if (target2.hasOwnProperty(featureIdentifier)) {
          const featureValue = target2[featureIdentifier];
          const entry = metrics.find((_entry) => _entry.featureIdentifier === featureIdentifier && _entry.featureValue === featureValue);
          if (entry) {
            entry.count++;
          } else {
            metrics.push({
              featureIdentifier,
              featureValue,
              count: 1
            });
          }
          logDebug("Metrics event: Flag", featureIdentifier, "has been read with value", featureValue);
        }
        return target2[featureIdentifier];
      }
    }) : {};
  };
  let storage = creatStorage();
  authenticate(apiKey, configurations).then((token) => {
    jwtToken = token;
    const decoded = jwt_decode_esm_default(token);
    logDebug("Authenticated", decoded);
    if (globalThis.localStorage && globalThis.localStorage.HARNESS_FF_METRICS) {
      try {
        metrics = JSON.parse(globalThis.localStorage.HARNESS_FF_METRICS);
        delete globalThis.localStorage.HARNESS_FF_METRICS;
        logDebug("Picking up metrics from previous session");
      } catch (error) {
      }
    }
    metricsSchedulerId = setTimeout(scheduleSendingMetrics, METRICS_FLUSH_INTERVAL);
    environment = decoded.environment;
    fetchFlags().then(() => {
      logDebug("Fetch all flags ok", storage);
    }).then(() => {
      startStream();
    }).then(() => {
      logDebug("Event stream ready", {storage});
      eventBus.emit(Event.READY, storage);
      if (!hasProxy) {
        Object.keys(storage).forEach((key) => {
          metrics.push({
            featureIdentifier: key,
            featureValue: storage[key],
            count: 1
          });
        });
      }
    }).catch((err) => {
      eventBus.emit(Event.ERROR, err);
    });
  }).catch((error) => {
    logError("Authentication error: ", error);
    eventBus.emit(Event.ERROR, error);
  });
  const fetchFlags = async () => {
    try {
      const res = await fetch(`${configurations.baseUrl}/client/env/${environment}/target/${target.identifier}/evaluations`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      });
      const data = await res.json();
      data.forEach((_evaluation) => {
        storage[_evaluation.flag] = convertValue(_evaluation);
      });
    } catch (error) {
      logError("Features fetch operation error: ", error);
      eventBus.emit(Event.ERROR, error);
      return error;
    }
  };
  const fetchFlag = async (identifier) => {
    try {
      const result = await fetch(`${configurations.baseUrl}/client/env/${environment}/target/${target.identifier}/evaluations/${identifier}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      });
      if (result.ok) {
        const flagInfo = await result.json();
        storage[identifier] = convertValue(flagInfo);
        eventBus.emit(Event.CHANGED, hasProxy ? new Proxy(flagInfo, {
          get(target2, property) {
            if (target2.hasOwnProperty(property) && property === "value") {
              const featureIdentifier = target2.flag;
              const featureValue = flagInfo.value;
              const entry = metrics.find((_entry) => _entry.featureIdentifier === featureIdentifier && _entry.featureValue === featureValue);
              if (entry) {
                entry.count++;
              } else {
                metrics.push({
                  featureIdentifier: property,
                  featureValue: String(featureValue),
                  count: 1
                });
              }
              logDebug("Metrics event: Flag", property, "has been read with value via stream update", featureValue);
            }
            return property === "value" ? convertValue(flagInfo) : flagInfo[property];
          }
        }) : {
          deleted: flagInfo.deleted,
          flag: flagInfo.flag,
          value: convertValue(flagInfo)
        });
        if (!hasProxy) {
          const featureIdentifier = flagInfo.flag;
          const entry = metrics.find((_entry) => _entry.featureIdentifier === featureIdentifier && _entry.featureValue === flagInfo.value);
          if (entry) {
            entry.count++;
          } else {
            metrics.push({
              featureIdentifier,
              featureValue: String(flagInfo.value),
              count: 1
            });
          }
        }
      } else {
        eventBus.emit(Event.ERROR, result);
      }
    } catch (error) {
      logError("Feature fetch operation error: ", error);
      eventBus.emit(Event.ERROR, error);
    }
  };
  const startStream = () => {
    if (!configurations.streamEnabled) {
      logDebug("Stream is disabled by configuration. Note: Polling is not yet supported");
      return;
    }
    eventSource = new EventSource(`${configurations.baseUrl}/stream`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "API-Key": apiKey
      }
    });
    eventSource.onopen = (event) => {
      logDebug("Stream connected", event);
      eventBus.emit(Event.CONNECTED);
    };
    eventSource.onclose = (event) => {
      logDebug("Stream disconnected");
      eventBus.emit(Event.DISCONNECTED);
    };
    eventSource.onerror = (event) => {
      logError("Stream has issue", event);
      eventBus.emit("error", event);
    };
    eventSource.addEventListener("*", (msg) => {
      const event = JSON.parse(msg.data);
      logDebug("Received event from stream: ", event);
      switch (event.event) {
        case "create":
          setTimeout(() => fetchFlag(event.identifier), 1e3);
          break;
        case "patch":
          fetchFlag(event.identifier);
          break;
        case "delete":
          delete storage[event.identifier];
          eventBus.emit(Event.CHANGED, {flag: event.identifier, value: void 0, deleted: true});
          logDebug("Evaluation deleted", {message: event, storage});
          break;
      }
    });
  };
  const on = (event, callback) => eventBus.on(event, callback);
  const off = (event, callback) => {
    if (event) {
      eventBus.off(event, callback);
    } else {
      close();
    }
  };
  const variation = (flag, defaultValue) => {
    const value = storage[flag];
    if (!hasProxy && value !== void 0) {
      const featureValue = value;
      const featureIdentifier = flag;
      const entry = metrics.find((_entry) => _entry.featureIdentifier === featureIdentifier && _entry.featureValue === featureValue);
      if (entry) {
        entry.count++;
      } else {
        metrics.push({
          featureIdentifier,
          featureValue,
          count: 1
        });
      }
    }
    return value !== void 0 ? value : defaultValue;
  };
  const close = () => {
    logDebug("Closing event stream");
    storage = creatStorage();
    clearTimeout(metricsSchedulerId);
    eventBus.all.clear();
    eventSource.close();
  };
  return {on, off, variation, close};
};
export {
  Event,
  initialize
};
//# sourceMappingURL=sdk.esm.js.map
