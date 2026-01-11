import {
  isSignal,
  isComputed,
  isFunction,
  isPrimitive,
} from '../utils';

import { unwrapOne } from '../signals';

export class NodePart {
  constructor(marker, ctxEffect) {
    this.marker = marker;
    this.ctxEffect = ctxEffect;
    this.nodes = [];
  }

  update(getter) {
    // Remove previous nodes
    this.nodes.forEach((n) => n.remove());
    this.nodes = [];

    let value = getter();
    value = unwrapOne(value);

    // Support fn -> value pattern
    if (isFunction(value) && !isSignal(value) && !isComputed(value)) {
      value = value();
    }

    const parent = this.marker.parentNode;
    if (!parent) return;

    const appendNode = (node) => {
      parent.insertBefore(node, this.marker);
      this.nodes.push(node);
    };

    const handleValue = (val) => {
      val = unwrapOne(val);

      if (isFunction(val) && !isSignal(val) && !isComputed(val)) {
        val = val();
      }

      if (val == null || val === false) return;

      // Template / fragment / arrays are handled by renderTemplate
      // and helpers in the template layer; here we treat non-primitive
      // values as stringified fallback.
      if (Array.isArray(val)) {
        val.forEach(handleValue);
        return;
      }

      if (isPrimitive(val)) {
        appendNode(document.createTextNode(String(val)));
        return;
      }

      appendNode(document.createTextNode(String(val)));
    };

    handleValue(value);
  }

  bind(getter) {
    this.ctxEffect(() => {
      this.update(getter);
    });
  }
}
