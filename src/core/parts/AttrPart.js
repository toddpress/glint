import { ValueBinding } from './Binding.js';
export class AttrPart extends ValueBinding {
  set(value) {
    if (value == null || value === false) this.element.removeAttribute(this.name);
    else this.element.setAttribute(this.name, value === true ? '' : String(value));
  }
}
export class BooleanAttrPart extends ValueBinding {
  set(value) { this.element.toggleAttribute(this.name, Boolean(value)); }
}
