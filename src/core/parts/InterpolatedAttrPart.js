import { isString } from '../utils';
import { unwrapOne } from '../../signals';

export class InterpolatedAttrPart {
  constructor(el, attrName, segments, ctxEffect) {
    this.el = el;
    this.attrName = attrName;
    this.segments = segments; // [string | getter, ...]
    this.ctxEffect = ctxEffect;
  }

  bind() {
    const { el, attrName: name, segments, ctxEffect } = this;

    ctxEffect(() => {
      const result = segments
        .map((seg) => {
          if (isString(seg)) return seg;
          let v = seg();
          v = unwrapOne(v);
          if (v == null || v === false) return '';
          return String(v);
        })
        .join('');

      el.setAttribute(name, result);
    });
  }
}
