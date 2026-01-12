import { unwrapOne } from '../signals';

export class AttrPart {
  constructor(el, attrName, ctxEffect) {
    this.el = el;
    this.attrName = attrName;
    this.ctxEffect = ctxEffect;
  }

  bind(getter) {
    const { el, attrName, ctxEffect } = this;

    ctxEffect(() => {
      let val = getter();
      val = unwrapOne(val);

      if (val == null || val === false) {
        el.removeAttribute(attrName);
      } else if (val === true) {
        el.setAttribute(attrName, '');
      } else {
        el.setAttribute(attrName, String(val));
      }
    });
  }
}
