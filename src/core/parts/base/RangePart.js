import { Part } from './Part'

export class RangePart extends Part {
  constructor(endMarker, parentScope) {
    super(parentScope);
    this.end = endMarker;
    this.start = null;
  }

  ensureRange() {
    if (!this.start) return;

    this.start = document.createComment('gl:part');
    this.end.parentNode?.insertBefore(this.start, this.end);
  }

  clearRange() {
    if (!this.start) return;

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

  dispose() {
    super.dispose();

    this.clearRange();
    this.start?.remove();
    this.start = null;
  }
}
