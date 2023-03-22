import Emiiter from "./emiiter";
import { log } from "../utils";

const STATUS = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
};

interface IOptions {
  protocol?: string | Array<string>;
  _reconnect?: boolean; // 是否重連
  _autoConnect?: boolean; // 是否自動鏈接
  _reconnectionAttempts?: number; // 重連次數
  _reconnectionDelay?: number; // 重連時間
}

export default class KWebsocket extends Emiiter {
  public kwebsocket: WebSocket | undefined;
  public url: string | URL;
  public options: IOptions | undefined;
  public protocol: string | Array<string>;
  public reconnectionCount: number = 0;
  public _autoConnect: boolean;
  public _reconnect: boolean;
  public _reconnectionAttempts: number;
  public _reconnectionDelay: number;
  public _status: number;
  public _reconnectTimeoutId: number | undefined;
  constructor(url: string | URL, options?: IOptions) {
    super();
    this.url = url;
    this.protocol = options?.protocol || [];
    this._autoConnect = options?._autoConnect || false;
    this._reconnect = options?._reconnect || false;
    this._reconnectionAttempts = options?._reconnectionAttempts || Infinity;
    this._reconnectionDelay = options?._reconnectionDelay || 500;
    this._status = STATUS.CLOSED;
    this._autoConnect && this.doOpen();
  }
  public doOpen(url: string | URL = this.url): this {
    try {
      if (this._status === STATUS.CLOSED) {
        this._status = STATUS.CONNECTING;
        if (typeof window === "object") {
          // window只存在于浏览器端
          this.kwebsocket = new WebSocket(url, this.protocol);
        } else if (
          Object.prototype.toString.call(process) === "[object process]"
        ) {
          // 由於 jest 是在 node 端運行，所以需要添加 node 環境的 websocket
          const node_websocket = require("ws");
          this.kwebsocket = new node_websocket(url, this.protocol);
        }
        this.addEventListeners();
      }
    } catch (error) {
      log("error", JSON.stringify(error));
    }
    return this;
  }
  public doClose(): this {
    this._status = STATUS.CLOSING;
    this._reconnect = false;
    (this.kwebsocket as WebSocket).close()
    this.kwebsocket = undefined
    return this;
  }
  private reconnect(): this {
    if (
      this.reconnectionCount < this._reconnectionAttempts &&
      this._status === STATUS.CLOSED
    ) {
      log("warning", "💕 重連中");
      this.reconnectionCount++;
      window.clearInterval(this._reconnectTimeoutId);
      this._reconnectTimeoutId = window.setTimeout(() => {
        this.doOpen();
      }, this._reconnectionDelay);
    }
    return this;
  }
  public send(msg: string): this {
    if (this._status === STATUS.CLOSING || this._status === STATUS.CLOSED) {
      return this;
    }
    if (this._status === STATUS.OPEN) {
      (this.kwebsocket as WebSocket).send(msg);
    }
    return this;
  }
  private addEventListeners(): this {
    ["onopen", "onclose", "onmessage", "onerror"].forEach((res: string) => {
      // @ts-ignore: Unreachable code error
      this.kwebsocket[res] = (data: any) => {
        if (res === "onopen") {
          super.emit(res);
          this._status = STATUS.OPEN;
          log("success", "🙂 連接成功");
        }
        if (res === "onmessage") {
          super.emit(res, data.data);
          log("success", "😄 成功收到訊息,訊息為 " + data.data);
        }
        if (res === "onclose") {
          super.emit(res, data);
          this._status = STATUS.CLOSED;
          log("error", "連接已關閉");
          this._reconnect && this.reconnect();
        }
        if (res === "onerror") {
          super.emit(res, data);
          this._status = STATUS.CLOSING;
          log("error", "連接失敗,發生錯誤");
        }
      };
    });
    return this;
  }
}
