class Emiiter<T = any> {
  private quenes: Map<any, Array<any>>;
  constructor() {
    this.quenes = new Map();
  }
  public on(eventName: string, fn: Function): this {
    this.quenes.has(eventName) || this.quenes.set(eventName, []);
    this.quenes.get(eventName)!.push(fn);
    return this;
  }
  public addEventListener(eventName: string, fn: Function): this {
    this.quenes.has(eventName) || this.quenes.set(eventName, []);
    this.quenes.get(eventName)!.push(fn);
    return this;
  }
  public off(eventName: string, fn: Function): this {
    const quene: Array<any> = this.quenes.get(eventName) || [];
    if (!quene) {
      return this;
    }
    for (let i = 0; i < quene.length; i++) {
      if (quene[i] === fn || quene[i].fn === fn) {
        quene.splice(i, 1);
      }
    }
    return this;
  }
  public once(eventName: string, fn: Function) {
    const that = this;
    const once = function(){
      that.off(eventName, fn);
      fn.call(that, arguments);
    }
    once.fn = fn;
    this.on(eventName, once);
    return this;
  }
  public emit(eventName: string, ...args: T[]) {
    const quene: Array<Function> = this.quenes.get(eventName) || [];
    if (quene) {
      for (const callback of quene) {
        callback.call(this, ...args);
      }
    }
    return this;
  }
}

export default Emiiter;
