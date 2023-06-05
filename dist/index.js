/******************************************************************************
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
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

var Emiiter = /** @class */ (function () {
    function Emiiter() {
        this.quenes = new Map();
    }
    Emiiter.prototype.on = function (eventName, fn) {
        this.quenes.has(eventName) || this.quenes.set(eventName, []);
        this.quenes.get(eventName).push(fn);
        return this;
    };
    Emiiter.prototype.addEventListener = function (eventName, fn) {
        this.quenes.has(eventName) || this.quenes.set(eventName, []);
        this.quenes.get(eventName).push(fn);
        return this;
    };
    Emiiter.prototype.off = function (eventName, fn) {
        var quene = this.quenes.get(eventName) || [];
        if (!quene) {
            return this;
        }
        for (var i = 0; i < quene.length; i++) {
            if (quene[i] === fn || quene[i].fn === fn) {
                quene.splice(i, 1);
            }
        }
        return this;
    };
    Emiiter.prototype.once = function (eventName, fn) {
        var that = this;
        var once = function () {
            that.off(eventName, fn);
            fn.call(that, arguments);
        };
        once.fn = fn;
        this.on(eventName, once);
        return this;
    };
    Emiiter.prototype.emit = function (eventName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var quene = this.quenes.get(eventName) || [];
        if (quene) {
            for (var _a = 0, quene_1 = quene; _a < quene_1.length; _a++) {
                var callback = quene_1[_a];
                callback.call.apply(callback, __spreadArray([this], args, false));
            }
        }
        return this;
    };
    return Emiiter;
}());

function log(type, msg) {
    var colorList = {
        success: "color:#67C23A",
        error: "color:#F56C6C",
        warning: "color:#409EFF",
    };
    console.log("%c " + msg, colorList[type]);
}

var STATUS = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
};
var KWebsocket = /** @class */ (function (_super) {
    __extends(KWebsocket, _super);
    function KWebsocket(url, options) {
        var _this = _super.call(this) || this;
        _this.reconnectionCount = 0;
        _this.url = url;
        _this.protocol = (options === null || options === void 0 ? void 0 : options.protocol) || [];
        _this._autoConnect = (options === null || options === void 0 ? void 0 : options._autoConnect) || false;
        _this._reconnect = (options === null || options === void 0 ? void 0 : options._reconnect) || false;
        _this._reconnectionAttempts = (options === null || options === void 0 ? void 0 : options._reconnectionAttempts) || Infinity;
        _this._reconnectionDelay = (options === null || options === void 0 ? void 0 : options._reconnectionDelay) || 500;
        _this._status = STATUS.CLOSED;
        _this._autoConnect && _this.doOpen();
        return _this;
    }
    KWebsocket.prototype.doOpen = function (url) {
        if (url === void 0) { url = this.url; }
        try {
            if (this._status === STATUS.CLOSED) {
                this._status = STATUS.CONNECTING;
                if (typeof window === 'object') {
                    // window只存在于浏览器端
                    this.kwebsocket = new WebSocket(url, this.protocol);
                }
                else if (Object.prototype.toString.call(process) === '[object process]') {
                    // 由於 jest 是在 node 端運行，所以需要添加 node 環境的 websocket
                    var node_websocket = require('ws');
                    this.kwebsocket = new node_websocket(url, this.protocol);
                }
                this.addEventListeners();
            }
        }
        catch (error) {
            log('error', JSON.stringify(error));
        }
        return this;
    };
    KWebsocket.prototype.doClose = function () {
        this._status = STATUS.CLOSING;
        this._reconnect = false;
        this.kwebsocket.close();
        this.kwebsocket = undefined;
        return this;
    };
    KWebsocket.prototype.reconnect = function () {
        var _this = this;
        if (this.reconnectionCount < this._reconnectionAttempts &&
            this._status === STATUS.CLOSED) {
            log('warning', '💕 重連中');
            this.reconnectionCount++;
            window.clearInterval(this._reconnectTimeoutId);
            this._reconnectTimeoutId = window.setTimeout(function () {
                _this.doOpen();
            }, this._reconnectionDelay);
        }
        return this;
    };
    KWebsocket.prototype.send = function (msg) {
        if (this._status === STATUS.CLOSING || this._status === STATUS.CLOSED) {
            return this;
        }
        if (this._status === STATUS.OPEN) {
            this.kwebsocket.send(msg);
        }
        return this;
    };
    KWebsocket.prototype.addEventListeners = function () {
        var _this = this;
        ['onopen', 'onclose', 'onmessage', 'onerror'].forEach(function (res) {
            // @ts-ignore: Unreachable code error
            _this.kwebsocket[res] = function (data) {
                if (res === 'onopen') {
                    _super.prototype.emit.call(_this, res);
                    _this._status = STATUS.OPEN;
                    log('success', '🙂 連接成功');
                }
                if (res === 'onmessage') {
                    _super.prototype.emit.call(_this, res, data.data);
                    log('success', '😄 成功收到訊息,訊息為 ' + data.data);
                }
                if (res === 'onclose') {
                    _super.prototype.emit.call(_this, res, data);
                    _this._status = STATUS.CLOSED;
                    log('error', '連接已關閉');
                    _this._reconnect && _this.reconnect();
                }
                if (res === 'onerror') {
                    _super.prototype.emit.call(_this, res, data);
                    _this._status = STATUS.CLOSING;
                    log('error', '連接失敗,發生錯誤');
                }
            };
        });
        return this;
    };
    return KWebsocket;
}(Emiiter));

export { KWebsocket as default };
//# sourceMappingURL=index.js.map
