import {
  isSignal,
  isComputed,
  isFunction,
  isTemplate,
} from '../utils';

import { unwrapOne, Signal } from '../signals';
import { renderTemplate } from '../template';
import { RangePart } from './base/RangePart';

export class NodePart extends RangePart {
  constructor(endMarker, ctxEffect) {
    super(endMarker);
    this.ctxEffect = ctxEffect;
    this.effectStop = null;
    this.child = null;
  }

  bind(getter) {
    this.ensureRange();

    this.effectStop?.();
    this.effectStop = this.ctxEffect(() => {
      Signal.batch(() => this.update(getter));
    });
  }

  dispose() {
    this.effectStop?.();
    this.effectStop = null;

    this.child?.dispose();
    this.child = null;

    super.dispose();
  }

  update(getter) {
    const value = normalize(getter);

    if (value === null || value === undefined || value === false) {
      this.#reset();
      return;
    }

    this.#reset();
    this.#render(value);
  }

  #reset() {
    this.child?.dispose();
    this.child = null;
    this.clearRange();
  }

  #render(val) {
    if (isTemplate(val)) {
      this.insert(renderTemplate(val, this.ctxEffect));
      return;
    }

    if (Array.isArray(val)) {
      val.forEach(v => this.#render(v));
      return;
    }

    this.insert(document.createTextNode(String(val)));
  }
}

function normalize(v) {
  v = unwrapOne(isFunction(v) && !isSignal(v) && !isComputed(v) ? v() : v);
  return v;
}
