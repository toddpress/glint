import { signal, effect, readValue } from '../signals/index.js';
export class Binding {
  constructor(scope) { this.scope = scope; this.source = signal(undefined); }
  wire(value) {
    this.source(value);
    effect(() => this.apply(this.source()), this.scope);
  }
  updateSource(value) { this.source(value); }
  dispose() { this.scope.dispose(); }
}
export class ValueBinding extends Binding {
  constructor(scope, element, name) { super(scope); this.element = element; this.name = name; }
  apply(source) { this.set(readValue(source)); }
}
