import {
  isSignal,
  isComputed,
  isFunction,
  isTemplate,
  isAbsentOrFalse,
} from '../utils';

import { unwrapOne, Signal } from '../signals';
import { expandTemplate, realizeBindings } from '../template';

import { RangePart } from './base/RangePart';

export class NodePart extends RangePart {
  constructor(endMarker, parentScope) {
    super(endMarker, parentScope);
  }

  bind(getter) {
    this.ensureRange();

    // Reset reactive work for this part only
    this.scope.disposeEffects();

    this.scope.effect(() => {
      Signal.batch(() => this.update(getter));
    });
  }

  update(getter) {
    const value = normalize(getter);

    if (isAbsentOrFalse(value)) {
      this.clearRange();
      return;
    }

    this.clearRange();
    this.#renderValue(value);
  }

  #renderValue(val) {
    // ---- template expansion
    if (isTemplate(val)) {
      const { fragment, bindingSites } = expandTemplate(val);
      this.insert(fragment);

      realizeBindings(this, bindingSites, {
        scope: this.scope,
      });

      return;
    }

    // ---- recursive flattening
    if (Array.isArray(val)) {
      val.forEach(v => this.#renderValue(v));

      return;
    }

    // ---- primitive fallback
    this.insert(document.createTextNode(String(val)));
  }
}

function normalize(v) {
  return unwrapOne(
    isFunction(v) && !isSignal(v) && !isComputed(v) ? v() : v
  );
}
