import { unwrapOne } from '../signals';

export class PropPart {
  constructor(el, propName, ctxEffect) {
    this.el = el;
    this.propName = propName;
    this.ctxEffect = ctxEffect;
  }

  bind(getter) {
    const { el, propName, ctxEffect } = this;

    ctxEffect(() => {
      let val = getter();
      val = unwrapOne(val);
      el[propName] = val;
    });
  }
}
