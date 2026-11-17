import { Binding } from './Binding.js';
import { readValue } from '../signals/index.js';
export class InterpolatedAttrPart extends Binding {
  constructor(scope, element, name, segments) {
    super(scope);
    this.element = element;
    this.name = name;
    this.segments = segments;
  }
  apply(values) {
    const result = this.segments.map(segment => {
      if (typeof segment === 'string') return segment;
      const value = readValue(values[segment.index]);
      return value == null || value === false ? '' : String(value);
    }).join('');
    this.element.setAttribute(this.name, result);
  }
}
