'use strict';

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

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

function Emiiter() { }
Emiiter.prototype.on = Emiiter.prototype.addEventListener = function (eventName, fn) {
    this._callbacks = this._callbacks || {};
    (this._callbacks['$' + eventName] =
        this._callbacks['$' + eventName] || []).push(fn);
    return this;
};
Emiiter.prototype.off = Emiiter.prototype.removeEventListener = function (eventName, fn) {
    if (!this._callback) {
        return this;
    }
    var _callbacks = this._callbacks['$' + eventName];
    if (!_callbacks) {
        return this;
    }
    for (var i = 0; i < _callbacks.length; i++) {
        if (_callbacks[i] === fn || _callbacks[i].fn === fn) {
            _callbacks.splice(i, 1);
        }
    }
    return this;
};
Emiiter.prototype.once = function (eventName, fn) {
    function once() {
        this.off(eventName, fn);
        fn.call(this, arguments);
    }
    once.fn = fn;
    this.on(eventName, once);
    return this;
};
Emiiter.prototype.emit = function (eventName) {
    var args = __spreadArray([], arguments, true).slice(1);
    var _callback = this._callbacks['$' + eventName];
    if (_callback) {
        for (var _i = 0, _callback_1 = _callback; _i < _callback_1.length; _i++) {
            var callback = _callback_1[_i];
            callback.call.apply(callback, __spreadArray([this], args, false));
        }
    }
    return this;
};

module.exports = Emiiter;
//# sourceMappingURL=bundle.cjs.js.map
