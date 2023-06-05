interface IOptions {
  protocol?: string | Array<string>;
  _reconnect?: Boolean; // 是否重連
  _autoConnect?: Boolean; // 是否自動鏈接
  _reconnectionAttempts?: number; // 重連次數
  _reconnectionDelay?: number; // 重連時間
}

export class Emiiter<T = any> {
  on(eventName: string, fn: Function): this;
  off(eventName: string, fn: Function): this;
  emit(eventName: string, ...args: T[]);
}
export default class KWebocket extends Emiiter {
  readonly _status: string;
  constructor(url?: string | URL, options?: IOptions);
  doOpen(url?: string | URL): this;
  doClose(): this;
  send(msg: string): this;
}
