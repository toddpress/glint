import { instantiateTemplate as instantiate } from './template-instance.js';
import { NodePart } from './parts/NodePart.js';
export { html, svg, mathml, TemplateResult, isTemplateResult } from './tags.js';
export const instantiateTemplate = (result, scope, doc = document) =>
  instantiate(result, scope, doc, (scope, start, end) => new NodePart(scope, start, end));
export const renderTemplate = (result, scope) => instantiateTemplate(result, scope).fragment;
