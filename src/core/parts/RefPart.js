import { Binding } from './Binding.js';
export class RefPart extends Binding {
  constructor(scope, element) {
    super(scope);
    this.element = element;
    this.current = null;
    scope.own(() => this.clear());
  }
  clear() {
    if (this.current?.current === this.element) this.current.current = null;
    this.current = null;
  }
  apply(ref) {
    this.clear();
    if (ref?.__glintRef) { ref.current = this.element; this.current = ref; }
    else throw new TypeError('Element expressions require a ref created by ref()');
  }
}
export const ref = () => ({ __glintRef: true, current: null });
