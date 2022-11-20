function Emiiter() {}

Emiiter.prototype.on = Emiiter.prototype.addEventListener = function (
  eventName: string,
  fn: Function
) {
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + eventName] =
    this._callbacks['$' + eventName] || []).push(fn);
  return this;
};

Emiiter.prototype.off = Emiiter.prototype.removeEventListener = function (
  eventName: string,
  fn: Function
) {
  if (!this._callback) {
    return this;
  }
  let _callbacks: Array<any> = this._callbacks['$' + eventName];
  if (!_callbacks) {
    return this;
  }
  for (let i = 0; i < _callbacks.length; i++) {
    if (_callbacks[i] === fn || _callbacks[i].fn === fn) {
      _callbacks.splice(i, 1);
    }
  }
  return this;
};

Emiiter.prototype.once = function (eventName: string, fn: Function) {
  function once() {
    this.off(eventName, fn);
    fn.call(this, arguments);
  }
  once.fn = fn;
  this.on(eventName, once);
  return this;
};

Emiiter.prototype.emit = function (eventName: string) {
  let args = [...arguments].slice(1);
  let _callback: Array<Function> = this._callbacks['$' + eventName];
  if (_callback) {
    for (let callback of _callback) {
      callback.call(this, ...args);
    }
  }
  return this;
};

export default Emiiter;
