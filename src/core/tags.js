export class TemplateResult {
  constructor(kind, strings, values) {
    this.kind = kind;
    this.strings = strings;
    this.values = values;
    this.__template = true;
  }
}
export const isTemplateResult = value => value instanceof TemplateResult;
const tag = kind => (strings, ...values) => new TemplateResult(kind, strings, values);
export const html = tag('html');
export const svg = tag('svg');
export const mathml = tag('mathml');
