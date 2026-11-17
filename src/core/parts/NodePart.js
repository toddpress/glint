import { isComputed, isFunction, isSignal, isTemplate } from '../utils';
import { Signal, unwrapOne } from '../signals';
import { getTemplateKey, instantiateTemplate } from '../template';
import { moveNodeBefore } from '../dom/move';

const resolve = (value) => {
  value = unwrapOne(value);
  return isFunction(value) && !isSignal(value) && !isComputed(value)
    ? value()
    : value;
};

export class NodePart {
  constructor(endMarker) {
    this.end = endMarker;
    this.start = document.createComment('gl:part');
    this.end.before(this.start);
    this.effectStop = null;
    this.keyed = null;
    this.templates = [];
  }

  bind(getter) {
    this.effectStop = Signal.effect(() => {
      Signal.batch(() => this.update(getter()));
    });
  }

  dispose() {
    this.effectStop?.();
    this.clear();
    this.start.remove();
  }

  clear() {
    this.keyed?.dispose();
    this.keyed = null;
    this.templates.splice(0).forEach((instance) => instance.dispose());

    let node = this.start.nextSibling;
    while (node && node !== this.end) {
      const next = node.nextSibling;
      node.remove();
      node = next;
    }
  }

  update(value) {
    value = resolve(value);
    let items;
    if (value?.__glintEach && value.keyed) {
      items = value.items;
    } else if (Array.isArray(value)) {
      const entries = Array.from(value, (tpl) => ({ key: getTemplateKey(tpl), tpl }));
      if (entries.some(({ key }) => key !== undefined)) {
        if (entries.some(({ key }) => key === undefined)) {
          throw new Error('Glint arrays cannot mix keyed and unkeyed items.');
        }
        items = entries;
      }
    }

    if (items) {
      const keys = new Set(items.map(({ key }) => key));
      if (keys.size !== items.length) {
        throw new Error('Glint arrays cannot contain duplicate keys.');
      }

      if (!this.keyed) {
        this.clear();
        this.keyed = new KeyedRange(this.end);
      }
      this.keyed.update(items, keys);
      return;
    }

    this.clear();
    this.renderValue(value);
  }

  renderValue(value) {
    value = resolve(value);
    if (value == null || value === false) return;

    if (isTemplate(value)) {
      const instance = instantiateTemplate(value);
      this.templates.push(instance);
      this.end.before(instance.fragment);
    } else if (Array.isArray(value)) {
      value.forEach((item) => this.renderValue(item));
    } else {
      this.end.before(document.createTextNode(String(value)));
    }
  }
}

class KeyedRange {
  constructor(end) {
    this.end = end;
    this.entries = new Map();
  }

  dispose() {
    for (const entry of this.entries.values()) this.remove(entry);
    this.entries.clear();
  }

  remove({ start, end, instance }) {
    instance.dispose();
    let node = start;
    while (node) {
      const next = node.nextSibling;
      node.remove();
      if (node === end) break;
      node = next;
    }
  }

  update(items, keys) {
    for (const [key, entry] of this.entries) {
      if (!keys.has(key)) {
        this.remove(entry);
        this.entries.delete(key);
      }
    }

    for (const { key, tpl } of items) {
      let entry = this.entries.get(key);

      if (entry && isTemplate(tpl) && entry.instance.strings === tpl.strings) {
        entry.instance.update(tpl);
      } else {
        // Use an ordinary NodePart for entries to retain the helper's support
        // for text, arrays, and other values besides templates.
        const fragment = document.createDocumentFragment();
        const end = document.createComment('gl:key');
        fragment.append(end);

        const previous = entry;
        if (isTemplate(tpl)) {
          const instance = instantiateTemplate(tpl);
          const start = document.createComment('gl:key');
          end.before(start, instance.fragment);
          entry = { start, end, instance };
        } else {
          const part = new NodePart(end);
          try {
            part.bind(() => tpl);
          } catch (error) {
            part.dispose();
            throw error;
          }
          entry = { start: part.start, end, instance: part };
        }

        (previous?.start ?? this.end).before(fragment);
        if (previous) this.remove(previous);
        this.entries.set(key, entry);
      }
    }

    let anchor = this.end;
    for (let index = items.length - 1; index >= 0; index--) {
      const entry = this.entries.get(items[index].key);
      if (entry.end.nextSibling !== anchor) {
        let node = entry.start;
        while (node) {
          const next = node.nextSibling;
          moveNodeBefore(node, anchor);
          if (node === entry.end) break;
          node = next;
        }
      }
      anchor = entry.start;
    }
  }
}
