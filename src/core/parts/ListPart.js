import { clearBetween, moveRange } from '../dom/range.js';
import { isTemplateResult } from '../tags.js';
import { extractKey } from '../template-analysis.js';
import { signal, readValue, untracked, batch } from '../signals/index.js';
import { callView } from '../../patterns/template.js';
import { warn } from '../../diagnostics/config.js';
export const isIterable = value => value != null && typeof value !== 'string' && typeof value[Symbol.iterator] === 'function' && !isTemplateResult(value);
export function flatten(value) {
  return isIterable(value) ? Array.from(value).flatMap(flatten) : [value];
}
/** Both array expressions and each() use the same range reconciliation. */
export class ListPart {
  constructor(scope, start, end, NodePart) {
    this.scope = scope;
    this.start = start;
    this.end = end;
    this.NodePart = NodePart;
    this.records = new Map();
    this.positions = [];
  }
  sync(value, spec = null) {
    const list = spec ? Array.from(value ?? []) : flatten(value).filter(item => item != null && item !== false);
    const keys = list.map((item, index) => {
      if (spec?.key) return spec.key(item, index);
      if (spec) {
        if (item != null && (typeof item === 'object' || typeof item === 'function')) {
          warn('object items in each(...) require a key function; using positional ownership');
          return index;
        }
        return item;
      }
      if (isTemplateResult(item)) {
        const key = readValue(extractKey(item));
        if (key !== undefined) return key;
        warn('array child template has no key; using positional ownership');
      }
      // Symbols prevent explicit keys from colliding with positional indexes.
      return this.positions[index] ??= Symbol(index);
    });
    const nextKeys = new Set(keys);
    if (nextKeys.size !== keys.length) throw new Error('Duplicate key in list expression');
    batch(() => {
      let before = this.end;
      for (let index = list.length - 1; index >= 0; index--) {
        const item = list[index];
        const key = keys[index];
        let record = this.records.get(key);
        if (!record) {
          const scope = this.scope.child('list item');
          const start = this.end.ownerDocument.createComment('gl:key:start');
          const end = this.end.ownerDocument.createComment('gl:key:end');
          this.end.parentNode.insertBefore(start, this.end);
          this.end.parentNode.insertBefore(end, this.end);
          const part = new this.NodePart(scope, start, end);
          record = { key, scope, start, end, part, item: signal(item), index: signal(index) };
          this.records.set(key, record);
          if (spec && !spec.rawItems) {
            record.view = spec.view;
            // Run row construction once; reactive item/index accessors survive updates.
            part.wire(untracked(() => callView(spec.view, record.item, record.index)));
          }
        }
        record.item(item);
        record.index(index);
        if (!spec) record.part.updateSource(item);
        else if (spec.rawItems) record.part.updateSource(untracked(() => callView(spec.view, item, index)));
        else if (record.view !== spec.view) {
          record.view = spec.view;
          record.part.updateSource(untracked(() => callView(spec.view, record.item, record.index)));
        }
        if (!record.part.started) record.part.wire(!spec ? item : callView(spec.view, item, index));
        moveRange(record.start, record.end, before);
        before = record.start;
      }
      for (const [key, record] of this.records) {
        if (!nextKeys.has(key)) { this.remove(record); this.records.delete(key); }
      }
    });
  }
  remove(record) {
    record.scope.dispose();
    clearBetween(record.start, record.end);
    record.start.remove();
    record.end.remove();
  }
  dispose() {
    for (const record of this.records.values()) this.remove(record);
    this.records.clear();
    this.scope.dispose();
  }
}
