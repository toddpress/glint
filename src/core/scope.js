/** Ownership for effects, listeners, refs, and nested views. */
export class Scope {
  constructor(label = 'scope', parent = null) {
    this.label = label;
    this.parent = parent;
    this.children = new Set();
    this.disposers = new Set();
    this.disposed = false;
    parent?.children.add(this);
  }
  own(disposer) {
    if (typeof disposer !== 'function') throw new TypeError('own expects a disposer function');
    if (this.disposed) { disposer(); return () => {}; }
    this.disposers.add(disposer);
    return () => this.disposers.delete(disposer);
  }
  child(label) {
    const child = new Scope(label, this);
    if (this.disposed) child.dispose();
    return child;
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.parent?.children.delete(this);
    const errors = [];
    for (const resource of [...this.children].reverse()) {
      try { resource.dispose(); } catch (error) { errors.push(error); }
    }
    for (const dispose of [...this.disposers].reverse()) {
      try { dispose(); } catch (error) { errors.push(error); }
    }
    this.children.clear();
    this.disposers.clear();
    if (errors.length) throw new AggregateError(errors, `Cleanup failed in ${this.label}`);
  }
}
