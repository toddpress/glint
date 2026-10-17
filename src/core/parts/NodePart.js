import { Binding } from './Binding.js';
import { readValue, untracked } from '../signals/index.js';
import { isTemplateResult } from '../tags.js';
import { instantiateTemplate } from '../template-instance.js';
import { isStructural } from '../../patterns/template.js';
import { ListPart, isIterable } from './ListPart.js';
import { StructuralPart } from './StructuralPart.js';
import { clearBetween } from '../dom/range.js';
import { warn } from '../../diagnostics/config.js';
export class NodePart extends Binding {
  constructor(scope, start, end) {
    super(scope);
    this.start = start;
    this.end = end;
    this.mode = null;
    scope.own(() => this.reset());
  }
  wire(value) { this.started = true; super.wire(value); }
  apply(source) {
    const value = readValue(source);
    // Parent expressions should not subscribe to reads while wiring child effects.
    untracked(() => this.set(value));
  }
  reset() {
    this.child?.dispose();
    this.child = null;
    this.innerScope?.dispose();
    this.innerScope = null;
    this.instance = null;
    this.text = null;
    this.node = null;
    clearBetween(this.start, this.end);
  }
  switchMode(mode) {
    if (mode === this.mode) return;
    this.reset();
    this.mode = mode;
  }
  set(value) {
    if (isStructural(value)) {
      this.switchMode(`structural:${value.kind}`);
      if (!this.child) this.child = new StructuralPart(this.scope.child(value.kind), this.start, this.end, value.kind, NodePart);
      if (!this.child.started) { this.child.started = true; this.child.wire(value); }
      else this.child.updateSource(value);
    } else if (isIterable(value)) {
      this.switchMode('array');
      if (!this.child) this.child = new ListPart(this.scope.child('array'), this.start, this.end, NodePart);
      this.child.sync(value);
    } else if (isTemplateResult(value)) {
      this.switchMode('template');
      if (this.instance?.update(value)) return;
      this.reset();
      this.innerScope = this.scope.child('template');
      this.instance = instantiateTemplate(value, this.innerScope, this.end.ownerDocument, (scope, start, end) => new NodePart(scope, start, end));
      this.end.parentNode.insertBefore(this.instance.fragment, this.end);
    } else if (value?.nodeType) {
      this.switchMode('node');
      if (this.node !== value) { clearBetween(this.start, this.end); this.end.parentNode.insertBefore(value, this.end); this.node = value; }
    } else {
      this.switchMode('primitive');
      if (value && typeof value === 'object') { warn('plain objects are not mountable; map them to templates or primitives', value); value = null; }
      const text = value == null || value === false ? '' : String(value);
      if (!this.text) { this.text = this.end.ownerDocument.createTextNode(text); this.end.parentNode.insertBefore(this.text, this.end); }
      else if (this.text.data !== text) this.text.data = text;
    }
  }
}
