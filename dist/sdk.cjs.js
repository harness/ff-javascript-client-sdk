var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __commonJS = (callback, module2) => () => {
  if (!module2) {
    module2 = {exports: {}};
    callback(module2.exports, module2);
  }
  return module2.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};
var __exportStar = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  return __exportStar(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? {get: () => module2.default, enumerable: true} : {value: module2, enumerable: true})), module2);
};

// node_modules/cross-fetch/dist/browser-ponyfill.js
var require_browser_ponyfill = __commonJS((exports2, module2) => {
  var __self__ = function(root) {
    function F() {
      this.fetch = false;
      this.DOMException = root.DOMException;
    }
    F.prototype = root;
    return new F();
  }(typeof self !== "undefined" ? self : exports2);
  (function(self2) {
    var irrelevant = function(exports3) {
      var support = {
        searchParams: "URLSearchParams" in self2,
        iterable: "Symbol" in self2 && "iterator" in Symbol,
        blob: "FileReader" in self2 && "Blob" in self2 && function() {
          try {
            new Blob();
            return true;
          } catch (e2) {
            return false;
          }
        }(),
        formData: "FormData" in self2,
        arrayBuffer: "ArrayBuffer" in self2
      };
      function isDataView(obj) {
        return obj && DataView.prototype.isPrototypeOf(obj);
      }
      if (support.arrayBuffer) {
        var viewClasses = [
          "[object Int8Array]",
          "[object Uint8Array]",
          "[object Uint8ClampedArray]",
          "[object Int16Array]",
          "[object Uint16Array]",
          "[object Int32Array]",
          "[object Uint32Array]",
          "[object Float32Array]",
          "[object Float64Array]"
        ];
        var isArrayBufferView = ArrayBuffer.isView || function(obj) {
          return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1;
        };
      }
      function normalizeName(name) {
        if (typeof name !== "string") {
          name = String(name);
        }
        if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
          throw new TypeError("Invalid character in header field name");
        }
        return name.toLowerCase();
      }
      function normalizeValue(value) {
        if (typeof value !== "string") {
          value = String(value);
        }
        return value;
      }
      function iteratorFor(items) {
        var iterator = {
          next: function() {
            var value = items.shift();
            return {done: value === void 0, value};
          }
        };
        if (support.iterable) {
          iterator[Symbol.iterator] = function() {
            return iterator;
          };
        }
        return iterator;
      }
      function Headers(headers) {
        this.map = {};
        if (headers instanceof Headers) {
          headers.forEach(function(value, name) {
            this.append(name, value);
          }, this);
        } else if (Array.isArray(headers)) {
          headers.forEach(function(header) {
            this.append(header[0], header[1]);
          }, this);
        } else if (headers) {
          Object.getOwnPropertyNames(headers).forEach(function(name) {
            this.append(name, headers[name]);
          }, this);
        }
      }
      Headers.prototype.append = function(name, value) {
        name = normalizeName(name);
        value = normalizeValue(value);
        var oldValue = this.map[name];
        this.map[name] = oldValue ? oldValue + ", " + value : value;
      };
      Headers.prototype["delete"] = function(name) {
        delete this.map[normalizeName(name)];
      };
      Headers.prototype.get = function(name) {
        name = normalizeName(name);
        return this.has(name) ? this.map[name] : null;
      };
      Headers.prototype.has = function(name) {
        return this.map.hasOwnProperty(normalizeName(name));
      };
      Headers.prototype.set = function(name, value) {
        this.map[normalizeName(name)] = normalizeValue(value);
      };
      Headers.prototype.forEach = function(callback, thisArg) {
        for (var name in this.map) {
          if (this.map.hasOwnProperty(name)) {
            callback.call(thisArg, this.map[name], name, this);
          }
        }
      };
      Headers.prototype.keys = function() {
        var items = [];
        this.forEach(function(value, name) {
          items.push(name);
        });
        return iteratorFor(items);
      };
      Headers.prototype.values = function() {
        var items = [];
        this.forEach(function(value) {
          items.push(value);
        });
        return iteratorFor(items);
      };
      Headers.prototype.entries = function() {
        var items = [];
        this.forEach(function(value, name) {
          items.push([name, value]);
        });
        return iteratorFor(items);
      };
      if (support.iterable) {
        Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
      }
      function consumed(body) {
        if (body.bodyUsed) {
          return Promise.reject(new TypeError("Already read"));
        }
        body.bodyUsed = true;
      }
      function fileReaderReady(reader) {
        return new Promise(function(resolve, reject) {
          reader.onload = function() {
            resolve(reader.result);
          };
          reader.onerror = function() {
            reject(reader.error);
          };
        });
      }
      function readBlobAsArrayBuffer(blob) {
        var reader = new FileReader();
        var promise = fileReaderReady(reader);
        reader.readAsArrayBuffer(blob);
        return promise;
      }
      function readBlobAsText(blob) {
        var reader = new FileReader();
        var promise = fileReaderReady(reader);
        reader.readAsText(blob);
        return promise;
      }
      function readArrayBufferAsText(buf) {
        var view = new Uint8Array(buf);
        var chars = new Array(view.length);
        for (var i = 0; i < view.length; i++) {
          chars[i] = String.fromCharCode(view[i]);
        }
        return chars.join("");
      }
      function bufferClone(buf) {
        if (buf.slice) {
          return buf.slice(0);
        } else {
          var view = new Uint8Array(buf.byteLength);
          view.set(new Uint8Array(buf));
          return view.buffer;
        }
      }
      function Body() {
        this.bodyUsed = false;
        this._initBody = function(body) {
          this._bodyInit = body;
          if (!body) {
            this._bodyText = "";
          } else if (typeof body === "string") {
            this._bodyText = body;
          } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
            this._bodyBlob = body;
          } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
            this._bodyFormData = body;
          } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
            this._bodyText = body.toString();
          } else if (support.arrayBuffer && support.blob && isDataView(body)) {
            this._bodyArrayBuffer = bufferClone(body.buffer);
            this._bodyInit = new Blob([this._bodyArrayBuffer]);
          } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
            this._bodyArrayBuffer = bufferClone(body);
          } else {
            this._bodyText = body = Object.prototype.toString.call(body);
          }
          if (!this.headers.get("content-type")) {
            if (typeof body === "string") {
              this.headers.set("content-type", "text/plain;charset=UTF-8");
            } else if (this._bodyBlob && this._bodyBlob.type) {
              this.headers.set("content-type", this._bodyBlob.type);
            } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
              this.headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
            }
          }
        };
        if (support.blob) {
          this.blob = function() {
            var rejected = consumed(this);
            if (rejected) {
              return rejected;
            }
            if (this._bodyBlob) {
              return Promise.resolve(this._bodyBlob);
            } else if (this._bodyArrayBuffer) {
              return Promise.resolve(new Blob([this._bodyArrayBuffer]));
            } else if (this._bodyFormData) {
              throw new Error("could not read FormData body as blob");
            } else {
              return Promise.resolve(new Blob([this._bodyText]));
            }
          };
          this.arrayBuffer = function() {
            if (this._bodyArrayBuffer) {
              return consumed(this) || Promise.resolve(this._bodyArrayBuffer);
            } else {
              return this.blob().then(readBlobAsArrayBuffer);
            }
          };
        }
        this.text = function() {
          var rejected = consumed(this);
          if (rejected) {
            return rejected;
          }
          if (this._bodyBlob) {
            return readBlobAsText(this._bodyBlob);
          } else if (this._bodyArrayBuffer) {
            return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
          } else if (this._bodyFormData) {
            throw new Error("could not read FormData body as text");
          } else {
            return Promise.resolve(this._bodyText);
          }
        };
        if (support.formData) {
          this.formData = function() {
            return this.text().then(decode);
          };
        }
        this.json = function() {
          return this.text().then(JSON.parse);
        };
        return this;
      }
      var methods = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"];
      function normalizeMethod(method) {
        var upcased = method.toUpperCase();
        return methods.indexOf(upcased) > -1 ? upcased : method;
      }
      function Request(input, options) {
        options = options || {};
        var body = options.body;
        if (input instanceof Request) {
          if (input.bodyUsed) {
            throw new TypeError("Already read");
          }
          this.url = input.url;
          this.credentials = input.credentials;
          if (!options.headers) {
            this.headers = new Headers(input.headers);
          }
          this.method = input.method;
          this.mode = input.mode;
          this.signal = input.signal;
          if (!body && input._bodyInit != null) {
            body = input._bodyInit;
            input.bodyUsed = true;
          }
        } else {
          this.url = String(input);
        }
        this.credentials = options.credentials || this.credentials || "same-origin";
        if (options.headers || !this.headers) {
          this.headers = new Headers(options.headers);
        }
        this.method = normalizeMethod(options.method || this.method || "GET");
        this.mode = options.mode || this.mode || null;
        this.signal = options.signal || this.signal;
        this.referrer = null;
        if ((this.method === "GET" || this.method === "HEAD") && body) {
          throw new TypeError("Body not allowed for GET or HEAD requests");
        }
        this._initBody(body);
      }
      Request.prototype.clone = function() {
        return new Request(this, {body: this._bodyInit});
      };
      function decode(body) {
        var form = new FormData();
        body.trim().split("&").forEach(function(bytes) {
          if (bytes) {
            var split = bytes.split("=");
            var name = split.shift().replace(/\+/g, " ");
            var value = split.join("=").replace(/\+/g, " ");
            form.append(decodeURIComponent(name), decodeURIComponent(value));
          }
        });
        return form;
      }
      function parseHeaders(rawHeaders) {
        var headers = new Headers();
        var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, " ");
        preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
          var parts = line.split(":");
          var key = parts.shift().trim();
          if (key) {
            var value = parts.join(":").trim();
            headers.append(key, value);
          }
        });
        return headers;
      }
      Body.call(Request.prototype);
      function Response(bodyInit, options) {
        if (!options) {
          options = {};
        }
        this.type = "default";
        this.status = options.status === void 0 ? 200 : options.status;
        this.ok = this.status >= 200 && this.status < 300;
        this.statusText = "statusText" in options ? options.statusText : "OK";
        this.headers = new Headers(options.headers);
        this.url = options.url || "";
        this._initBody(bodyInit);
      }
      Body.call(Response.prototype);
      Response.prototype.clone = function() {
        return new Response(this._bodyInit, {
          status: this.status,
          statusText: this.statusText,
          headers: new Headers(this.headers),
          url: this.url
        });
      };
      Response.error = function() {
        var response = new Response(null, {status: 0, statusText: ""});
        response.type = "error";
        return response;
      };
      var redirectStatuses = [301, 302, 303, 307, 308];
      Response.redirect = function(url, status) {
        if (redirectStatuses.indexOf(status) === -1) {
          throw new RangeError("Invalid status code");
        }
        return new Response(null, {status, headers: {location: url}});
      };
      exports3.DOMException = self2.DOMException;
      try {
        new exports3.DOMException();
      } catch (err) {
        exports3.DOMException = function(message, name) {
          this.message = message;
          this.name = name;
          var error = Error(message);
          this.stack = error.stack;
        };
        exports3.DOMException.prototype = Object.create(Error.prototype);
        exports3.DOMException.prototype.constructor = exports3.DOMException;
      }
      function fetch2(input, init) {
        return new Promise(function(resolve, reject) {
          var request = new Request(input, init);
          if (request.signal && request.signal.aborted) {
            return reject(new exports3.DOMException("Aborted", "AbortError"));
          }
          var xhr = new XMLHttpRequest();
          function abortXhr() {
            xhr.abort();
          }
          xhr.onload = function() {
            var options = {
              status: xhr.status,
              statusText: xhr.statusText,
              headers: parseHeaders(xhr.getAllResponseHeaders() || "")
            };
            options.url = "responseURL" in xhr ? xhr.responseURL : options.headers.get("X-Request-URL");
            var body = "response" in xhr ? xhr.response : xhr.responseText;
            resolve(new Response(body, options));
          };
          xhr.onerror = function() {
            reject(new TypeError("Network request failed"));
          };
          xhr.ontimeout = function() {
            reject(new TypeError("Network request failed"));
          };
          xhr.onabort = function() {
            reject(new exports3.DOMException("Aborted", "AbortError"));
          };
          xhr.open(request.method, request.url, true);
          if (request.credentials === "include") {
            xhr.withCredentials = true;
          } else if (request.credentials === "omit") {
            xhr.withCredentials = false;
          }
          if ("responseType" in xhr && support.blob) {
            xhr.responseType = "blob";
          }
          request.headers.forEach(function(value, name) {
            xhr.setRequestHeader(name, value);
          });
          if (request.signal) {
            request.signal.addEventListener("abort", abortXhr);
            xhr.onreadystatechange = function() {
              if (xhr.readyState === 4) {
                request.signal.removeEventListener("abort", abortXhr);
              }
            };
          }
          xhr.send(typeof request._bodyInit === "undefined" ? null : request._bodyInit);
        });
      }
      fetch2.polyfill = true;
      if (!self2.fetch) {
        self2.fetch = fetch2;
        self2.Headers = Headers;
        self2.Request = Request;
        self2.Response = Response;
      }
      exports3.Headers = Headers;
      exports3.Request = Request;
      exports3.Response = Response;
      exports3.fetch = fetch2;
      return exports3;
    }({});
  })(__self__);
  delete __self__.fetch.polyfill;
  exports2 = __self__.fetch;
  exports2.default = __self__.fetch;
  exports2.fetch = __self__.fetch;
  exports2.Headers = __self__.Headers;
  exports2.Request = __self__.Request;
  exports2.Response = __self__.Response;
  module2.exports = exports2;
});

// node_modules/event-source-polyfill/src/eventsource.js
var require_eventsource = __commonJS((exports2, module2) => {
  /** @license
   * eventsource.js
   * Available under MIT License (MIT)
   * https://github.com/Yaffle/EventSource/
   */
  (function(global) {
    "use strict";
    var setTimeout2 = global.setTimeout;
    var clearTimeout = global.clearTimeout;
    var XMLHttpRequest2 = global.XMLHttpRequest;
    var XDomainRequest = global.XDomainRequest;
    var ActiveXObject = global.ActiveXObject;
    var NativeEventSource = global.EventSource;
    var document = global.document;
    var Promise2 = global.Promise;
    var fetch2 = global.fetch;
    var Response = global.Response;
    var TextDecoder = global.TextDecoder;
    var TextEncoder = global.TextEncoder;
    var AbortController = global.AbortController;
    if (typeof window !== "undefined" && !("readyState" in document) && document.body == null) {
      document.readyState = "loading";
      window.addEventListener("load", function(event) {
        document.readyState = "complete";
      }, false);
    }
    if (XMLHttpRequest2 == null && ActiveXObject != null) {
      XMLHttpRequest2 = function() {
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
          clearTimeout(that._sendTimeout);
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
            clearTimeout(timeout);
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
            clearTimeout(timeout);
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
      if ("contentType" in xhr || !("ontimeout" in XMLHttpRequest2.prototype)) {
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
      if ((!("ontimeout" in XMLHttpRequest2.prototype) || !("sendAsBinary" in XMLHttpRequest2.prototype) && !("mozAnon" in XMLHttpRequest2.prototype)) && document != void 0 && document.readyState != void 0 && document.readyState !== "complete") {
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
    if (XMLHttpRequest2 != null && XMLHttpRequest2.HEADERS_RECEIVED == null) {
      XMLHttpRequest2.HEADERS_RECEIVED = 2;
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
        if (xhr.readyState === XMLHttpRequest2.HEADERS_RECEIVED) {
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
    function EventSourcePolyfill(url, options) {
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
      return XMLHttpRequest2 != void 0 && "withCredentials" in XMLHttpRequest2.prototype || XDomainRequest == void 0 ? new XMLHttpRequest2() : new XDomainRequest();
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
                      clearTimeout(timeout);
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
            clearTimeout(timeout);
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
          clearTimeout(timeout);
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
    EventSourcePolyfill.prototype = Object.create(EventTarget.prototype);
    EventSourcePolyfill.prototype.CONNECTING = CONNECTING;
    EventSourcePolyfill.prototype.OPEN = OPEN;
    EventSourcePolyfill.prototype.CLOSED = CLOSED;
    EventSourcePolyfill.prototype.close = function() {
      this._close();
    };
    EventSourcePolyfill.CONNECTING = CONNECTING;
    EventSourcePolyfill.OPEN = OPEN;
    EventSourcePolyfill.CLOSED = CLOSED;
    EventSourcePolyfill.prototype.withCredentials = void 0;
    var R = NativeEventSource;
    if (XMLHttpRequest2 != void 0 && (NativeEventSource == void 0 || !("withCredentials" in NativeEventSource.prototype))) {
      R = EventSourcePolyfill;
    }
    (function(factory) {
      if (typeof module2 === "object" && typeof module2.exports === "object") {
        var v = factory(exports2);
        if (v !== void 0)
          module2.exports = v;
      } else if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
      } else {
        factory(global);
      }
    })(function(exports3) {
      exports3.EventSourcePolyfill = EventSourcePolyfill;
      exports3.NativeEventSource = NativeEventSource;
      exports3.EventSource = R;
    });
  })(typeof globalThis === "undefined" ? typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : exports2 : globalThis);
});

// src/index.ts
__markAsModule(exports);
__export(exports, {
  Event: () => Event,
  initialize: () => initialize
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

// src/index.ts
var import_cross_fetch = __toModule(require_browser_ponyfill());

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
  baseUrl: "http://localhost:7999/api/1.0",
  streamEnabled: true,
  allAttributesPrivate: false,
  privateAttributeNames: []
};

// src/index.ts
var authenticate = async (clientID, configuration) => {
  try {
    const response = await fetch(`${configuration.baseUrl}/client/auth`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({apiKey: clientID})
    });
    const data = await response.json();
    return data.authToken;
  } catch (error) {
    return error;
  }
};
var initialize = (apiKey, target, options) => {
  let storage = {};
  const eventBus = mitt_es_default();
  const configurations = {...defaultOptions, ...options};
  const logError = (message, ...args) => console.error(`[FF-SDK] ${message}`, ...args);
  const logDebug = (message, ...args) => {
    if (configurations.debug) {
      console.debug(`[FF-SDK] ${message}`, ...args);
    }
  };
  let environment;
  let eventSource;
  let jwtToken;
  authenticate(apiKey, configurations).then((token) => {
    jwtToken = token;
    const decoded = jwt_decode_esm_default(token);
    logDebug("Authenticated", decoded);
    environment = decoded.environment;
    fetchFlags().then(() => {
      startStream();
    }).then(() => {
      logDebug("Event stream ready", {storage});
      eventBus.emit(Event.READY, storage);
    }).catch((err) => {
      eventBus.emit(Event.ERROR, err);
    });
  }).catch((error) => {
    logError("Authentication error: ", error);
    eventBus.emit(Event.ERROR, error);
  });
  const fetchFlags = async () => {
    try {
      const res = await fetch(`${configurations.baseUrl}/client/env/${environment}/target/${target.identifier}/evaluations`);
      const data = await res.json();
      data.forEach((elem) => {
        storage[elem.flag] = elem.value;
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
        storage[identifier] = flagInfo.value;
        eventBus.emit(Event.CHANGED, flagInfo);
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
      return;
    }
    eventSource = new import_event_source_polyfill.EventSourcePolyfill(`${configurations.baseUrl}/stream`, {
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
  const variation = (flag, defaultValue) => storage[flag] || defaultValue;
  const close = () => {
    logDebug("Closing event stream");
    storage = {};
    eventBus.all.clear();
    eventSource.close();
  };
  return {on, off, variation, close};
};
//# sourceMappingURL=sdk.cjs.js.map
