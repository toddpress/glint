import { isFunction, isSignal } from '../utils';
import { unwrapOne } from '../../signals';

export class EventPart {
  constructor(el, eventName, ctxEffect) {
    this.el = el;
    this.eventName = eventName;
    this.ctxEffect = ctxEffect;
    this.current = null;
  }

  bind(getter) {
    const { el, eventName, ctxEffect } = this;

    ctxEffect(() => {
      const v = getter();
      let fn = unwrapOne(v);

      if (this.current) {
        el.removeEventListener(eventName, this.current);
        this.current = null;
      }

      if (isSignal(fn)) fn = fn();

      if (isFunction(fn)) {
        this.current = fn;
        el.addEventListener(eventName, this.current);
      }
    });
  }
}
