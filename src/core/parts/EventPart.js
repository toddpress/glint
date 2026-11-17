import { Binding } from './Binding.js';
import { isSignal } from '../signals/index.js';
export class EventPart extends Binding {
  constructor(scope, element, name) {
    super(scope);
    this.element = element;
    this.name = name;
    this.current = null;
    scope.own(() => this.remove());
  }
  remove() {
    if (this.current) this.element.removeEventListener(this.name, this.current);
    this.current = null;
  }
  apply(source) {
    const handler = isSignal(source) ? source() : source;
    this.remove();
    if (typeof handler === 'function' || typeof handler?.handleEvent === 'function') {
      this.current = handler;
      this.element.addEventListener(this.name, handler);
    }
  }
}
