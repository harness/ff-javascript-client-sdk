'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var jwt_decode = require('jwt-decode');
var fetch = require('isomorphic-unfetch');
var EventSource = require('eventsource');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () {
                        return e[k];
                    }
                });
            }
        });
    }
    n['default'] = e;
    return Object.freeze(n);
}

var jwt_decode__default = /*#__PURE__*/_interopDefaultLegacy(jwt_decode);
var fetch__default = /*#__PURE__*/_interopDefaultLegacy(fetch);
var EventSource__namespace = /*#__PURE__*/_interopNamespace(EventSource);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

(function () {
    if (typeof window.CustomEvent === 'function')
        return false;
    var CustomEvent = function (event, params) {
        params = params || { bubbles: false, cancelable: false, detail: null };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    };
    window.CustomEvent = CustomEvent;
})();

var EventBus = /** @class */ (function () {
    function EventBus(description) {
        if (description === void 0) { description = ''; }
        this.eventTarget = document.appendChild(document.createComment(description));
        this.callbacks = new Map();
    }
    EventBus.prototype.on = function (type, listener, configuration) {
        if (configuration === void 0) { configuration = {}; }
        var listeners = this.callbacks.get(type);
        if (this.callbacks.has(type) && !listeners.includes(listener)) {
            listeners.push(listener);
        }
        this.callbacks.set(type, listeners);
        this.eventTarget.addEventListener(type, listener, configuration);
    };
    EventBus.prototype.once = function (type, listener) {
        this.on(type, listener, { once: true });
    };
    EventBus.prototype.off = function (type, listener) {
        // remove specified listener
        if (type && listener) {
            this.eventTarget.removeEventListener(type, listener);
            return;
        }
        if (type) {
            for (var _i = 0, _a = this.callbacks.get(type); _i < _a.length; _i++) {
                var callback = _a[_i];
                this.eventTarget.removeEventListener(type, callback);
            }
            this.callbacks.delete(type);
            return;
        }
        // if no argument specified, remove all listeners
        for (var _b = 0, _c = this.callbacks; _b < _c.length; _b++) {
            var _d = _c[_b], key = _d[0], listeners = _d[1];
            for (var _e = 0, listeners_1 = listeners; _e < listeners_1.length; _e++) {
                listener = listeners_1[_e];
                this.eventTarget.removeEventListener(key, listener);
            }
        }
        this.callbacks.clear();
    };
    EventBus.prototype.emit = function (type, detail) {
        return this.eventTarget.dispatchEvent(new CustomEvent(type, { detail: detail }));
    };
    return EventBus;
}());

var getLocalStorage = function () {
    try {
        if (window.localStorage) {
            return {
                get: function (key) {
                    return new Promise(function (resolve) {
                        resolve(window.localStorage.getItem(key));
                    });
                },
                set: function (key, value) {
                    return new Promise(function (resolve) {
                        window.localStorage.setItem(key, value);
                        resolve(value);
                    });
                },
                remove: function (key) {
                    return new Promise(function (resolve) {
                        window.localStorage.removeItem(key);
                        resolve(undefined);
                    });
                },
            };
        }
    }
    catch (e) {
        return null;
    }
};
var getEventSource = function () {
    return function (url, headers) { return new EventSource__namespace(url, headers); };
};
var browserPlatform = (function () {
    return {
        logger: console,
        eventBus: new EventBus('features'),
        localStorage: getLocalStorage(),
        eventSource: getEventSource(),
        userAgent: 'js-client',
    };
});

var defaultConfiguration = {
    debug: false,
    baseUrl: 'http://localhost:7999/api/1.0',
    streamEnabled: false,
    allAttributesPrivate: false,
    privateAttributeNames: [],
};

var initialize = function (apiKey, target, options) {
    var platform = browserPlatform();
    var logger = platform.logger;
    var configurations = __assign(__assign({}, defaultConfiguration), options);
    var environment;
    var eventSource;
    var jwtToken;
    var error;
    authenticate(apiKey, configurations)
        .then(function (token) {
        jwtToken = token;
        var decoded = jwt_decode__default['default'](token);
        if (configurations.debug)
            logger.info('authenticated');
        environment = decoded.environment;
        initialiazitionFinished();
    })
        .catch(function (err) {
        error = err;
        if (configurations.debug)
            logger.error('Authentication error: ', error);
    });
    var fetchFlags = function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    platform.eventBus.emit('loading', true);
                    return [4 /*yield*/, fetch__default['default'](configurations.baseUrl + "/client/env/" + environment + "/target/" + target.identifier + "/evaluations")];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    data.forEach(function (elem) {
                        platform.localStorage.set(elem.flag, elem.value);
                    });
                    platform.eventBus.emit('loading', false);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    if (configurations.debug)
                        logger.error('Features fetch operation error: ', error);
                    return [2 /*return*/, err_1];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var fetchFlag = function (identifier) { return __awaiter(void 0, void 0, void 0, function () {
        var res, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    platform.eventBus.emit('loading', true);
                    return [4 /*yield*/, fetch__default['default'](configurations.baseUrl + "/client/env/" + environment + "/target/" + target.identifier + "/evaluations/" + identifier, {
                            headers: {
                                Authorization: "Bearer " + jwtToken,
                            },
                        })];
                case 1:
                    res = _a.sent();
                    platform.eventBus.emit('loading', false);
                    return [4 /*yield*/, res.json()];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    err_2 = _a.sent();
                    if (configurations.debug)
                        logger.error('Feature fetch operation error: ', error);
                    return [2 /*return*/, err_2];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var startStream = function () {
        if (!configurations.streamEnabled)
            return;
        eventSource = platform.eventSource(configurations.baseUrl + "/stream", {
            headers: {
                Authorization: "Bearer " + jwtToken,
                'API-Key': apiKey,
            },
        });
        eventSource.onmessage = function (event) {
            logger.info('Msg received', event);
        };
        eventSource.onopen = function (event) {
            if (configurations.debug)
                logger.info('Stream connected');
            platform.eventBus.emit('connected', event);
        };
        eventSource.onclose = function (event) {
            if (configurations.debug)
                logger.info('Stream disconnected');
            platform.eventBus.emit('disconnected', event);
        };
        eventSource.onerror = function (event) {
            if (configurations.debug)
                logger.error(event);
            platform.eventBus.emit('error', event);
        };
        eventSource.addEventListener('*', function (msg) {
            var message = JSON.parse(msg.data);
            if (configurations.debug)
                logger.info('received on *: ', message);
            switch (message.event) {
                case 'create':
                case 'patch':
                    fetchFlag(message.identifier).then(function (data) {
                        platform.localStorage.set(data.flag, data.value).then(function () {
                            platform.eventBus.emit('changed', data);
                            logger.info('evaluation saved', data.flag, data.value);
                        });
                    });
                    break;
                case 'delete':
                    platform.localStorage.remove(message.identifier).then(function () {
                        platform.eventBus.emit('changed', message.identifier);
                        logger.info('evaluation removed', message.identifier);
                    });
                    break;
            }
        });
    };
    var variation = function (flag, defaultValue) { return __awaiter(void 0, void 0, Promise, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, platform.localStorage.get(flag)];
                case 1: return [2 /*return*/, (_a.sent()) || defaultValue];
            }
        });
    }); };
    var initialiazitionFinished = function () {
        fetchFlags()
            .then(function () {
            // start stream only when we get all evaluations
            startStream();
        })
            .catch(function (err) {
            platform.eventBus.emit('error', err);
        });
        if (configurations.debug)
            logger.info('Finished');
        platform.eventBus.emit('ready', true);
    };
    var close = function () {
        eventSource.close();
        platform.eventBus.off();
        if (configurations.debug)
            logger.info('Closing client');
    };
    var on = function (event, callback) {
        platform.eventBus.on(event, callback);
    };
    var off = function (event, callback) {
        platform.eventBus.on(event, callback);
    };
    return {
        on: on,
        off: off,
        variation: variation,
        close: close,
    };
};
var authenticate = function (clientID, configuration) { return __awaiter(void 0, void 0, Promise, function () {
    var response, data, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, fetch__default['default'](configuration.baseUrl + "/client/auth", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            apiKey: clientID,
                        }),
                    })];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
            case 2:
                data = _a.sent();
                return [2 /*return*/, data.authToken];
            case 3:
                error_1 = _a.sent();
                return [2 /*return*/, error_1];
            case 4: return [2 /*return*/];
        }
    });
}); };

exports.initialize = initialize;
