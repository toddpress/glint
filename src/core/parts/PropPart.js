import { ValueBinding } from './Binding.js';
export class PropPart extends ValueBinding {
  set(value) { this.element[this.name] = value; }
}
