import { isFunction, isSignal } from '../utils';
import { unwrapOne } from '../signals';

export class EventPart {
  constructor(el, eventName, ctxEffect) {
    this.el = el;
    this.eventName = eventName;
    this.ctxEffect = ctxEffect;
  }

  bind(getter) {
    const { el, eventName, ctxEffect } = this;

    ctxEffect(() => {
      const v = getter();
      let fn = unwrapOne(v);

      if (isSignal(fn)) fn = fn();

      if (isFunction(fn)) {
        el.addEventListener(eventName, fn);
        return () => el.removeEventListener(eventName, fn);
      }
    });
  }
}
