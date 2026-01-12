import {
  isSignal,
  isComputed,
  isFunction,
  isTemplate,
} from '../utils';

import { unwrapOne } from '../signals';
import { renderTemplate } from '../template';

export class NodePart {
  constructor(endMarker, ctxEffect) {
    this.end = endMarker;
    this.ctxEffect = ctxEffect;

    this.start = null;           // created lazily
    this.effectStop = null;      // this part’s own reactive subscription
    this.child = null;           // e.g. KeyedEachPart
  }

  bind(getter) {
    if (!this.start) {
      this.start = document.createComment('gl:part');
      this.end.parentNode?.insertBefore(this.start, this.end);
    }

    // One reactive subscription per NodePart
    this.effectStop?.();
    this.effectStop = this.ctxEffect(() => {
      Signal.batch(() => this.update(getter));
    });
  }

  dispose() {
    this.child?.dispose?.();
    this.child = null;

    this.effectStop?.();
    this.effectStop = null;

    this.clear();

    this.start?.remove();
    this.start = null;
    // end marker is owned by template compilation
  }

  clear() {
    if (!this.start) return;

    // Remove everything between start and end
    let n = this.start.nextSibling;
    while (n && n !== this.end) {
      const next = n.nextSibling;
      n.remove();
      n = next;
    }
  }

  insert(node) {
    this.end.parentNode?.insertBefore(node, this.end);
  }

  update(getter) {
    let value = unwrapOne(getter());

    if (isFunction(value) && !isSignal(value) && !isComputed(value)) {
      value = value();
    }

    if (value == null || value === false) {
      this.child?.dispose?.();
      this.child = null;
      this.clear();
      return;
    }

    // Keyed each descriptor takes over this part’s range
    if (value?.__glintEach && value.keyed) {
      if (!(this.child instanceof KeyedEachPart)) {
        this.child?.dispose?.();
        this.child = new KeyedEachPart(this.start, this.end, this.ctxEffect);
      }
      this.child.update(value.items);
      return;
    }

    // Plain mode
    this.child?.dispose?.();
    this.child = null;
    this.clear();

    this.#renderValue(value);
  }

  #renderValue(val) {
    val = unwrapOne(val);

    if (isFunction(val) && !isSignal(val) && !isComputed(val)) {
      val = val();
    }

    if (val == null || val === false) return;

    if (isTemplate(val)) {
      // IMPORTANT: renderTemplate receives a ctxEffect for nested parts.
      // For correctness, nested parts must also be range-based like this one.
      this.insert(renderTemplate(val, this.ctxEffect));
      return;
    }

    if (Array.isArray(val)) {
      val.forEach((x) => this.#renderValue(x));
      return;
    }

    this.insert(document.createTextNode(String(val)));
  }
}

class KeyedEachPart {
  constructor(start, end, ctxEffect) {
    this.start = start;
    this.end = end;
    this.ctxEffect = ctxEffect;
    this.entries = new Map(); // key -> { start, end, part }
  }

  dispose() {
    Array.from(this.entries.values()).forEach((e) => {
      e.part.dispose?.();
      e.start.remove();
      e.end.remove();
    });
    this.entries.clear();

    // Clear any stray nodes inside our range
    let n = this.start.nextSibling;
    while (n && n !== this.end) {
      const next = n.nextSibling;
      n.remove();
      n = next;
    }
  }

  update(items) {
    const parent = this.end.parentNode;
    if (!parent) return;

    const nextKeys = new Set(items.map((i) => i.key));

    // Remove vanished keys
    Array.from(this.entries.entries())
      .filter(([key]) => !nextKeys.has(key))
      .forEach(([, entry]) => {
        entry.part.dispose?.();
        entry.start.remove();
        entry.end.remove();
        this.entries.delete(entry.key);
      });

    // Ensure entries exist + update their content
    items.forEach(({ key, tpl }) => {
      if (!this.entries.has(key)) {
        const s = document.createComment(`gl:key:${key}:start`);
        const e = document.createComment(`gl:key:${key}:end`);
        parent.insertBefore(s, this.end);
        parent.insertBefore(e, this.end);

        const part = new NodePart(e, this.ctxEffect);
        part.start = s; // reuse the keyed start marker
        part.bind(() => tpl);

        this.entries.set(key, { key, start: s, end: e, part });
      } else {
        const entry = this.entries.get(key);
        entry.part.update(() => tpl);
      }
    });

    // Reorder by moving each key range in order before this.end
    items
      .map(({ key }) => this.entries.get(key))
      .forEach((entry) => {
        const frag = document.createDocumentFragment();

        // move [entry.start .. entry.end] inclusive
        let n = entry.start;
        while (n) {
          const next = n.nextSibling;
          frag.appendChild(n);
          if (n === entry.end) break;
          n = next;
        }

        parent.insertBefore(frag, this.end);
      });
  }
}
