import { RangePart } from './base/RangePart';

export class KeyedEachPart extends RangePart {
  constructor(start, end, ctxEffect) {
    super(end);
    this.start = start;
    this.ctxEffect = ctxEffect;
    this.records = new Map();
  }

  update(items) {
    const parent = this.end.parentNode;
    if (!parent) return;

    const nextKeys = new Set(items.map(i => i.key));

    // ---- removals
    for (const [key, record] of this.records) {
      if (nextKeys.has(key)) continue;

      record.part.dispose();
      record.start.remove();
      record.end.remove();
      this.records.delete(key);
    }

    // ---- ensure + update
    items.forEach(({ key, tpl }) => {
      let record = this.records.get(key);

      if (!record) {
        record = this.#createRecord(key, parent);
        this.records.set(key, record);
      }

      record.part.bind(() => tpl);
    });

    // ---- reorder DOM ranges
    items.forEach(({ key }) => {
      const { start, end } = this.records.get(key);
      this.#moveRange(start, end, parent);
    });
  }

  dispose() {
    // child parts handled by base Part logic
    super.dispose();

    this.records.forEach((record) => {
      record.start.remove();
      record.end.remove();
    });
    this.records.clear();
  }

  // ---------- private helpers ----------

  #createRecord(key, parent) {
    const start = document.createComment(`gl:key:${key}:start`);
    const end = document.createComment(`gl:key:${key}:end`);

    parent.insertBefore(start, this.end);
    parent.insertBefore(end, this.end);

    const part = this.addChild(
      new NodePart(end, this.ctxEffect)
    );
    part.start = start;

    return { key, start, end, part };
  }

  #moveRange(start, end, parent) {
    let n = start;
    const frag = document.createDocumentFragment();

    while (n) {
      const next = n.nextSibling;
      frag.appendChild(n);
      if (n === end) break;
      n = next;
    }

    parent.insertBefore(frag, this.end);
  }
}
