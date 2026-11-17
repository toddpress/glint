import { createMarker, extractMarkers } from './markers/index.js';
const caches = new WeakMap();
/** Cache by document, template literal identity, and namespace. */
export function analyzeTemplate(result, doc = document) {
  let cache = caches.get(doc);
  if (!cache) caches.set(doc, cache = new WeakMap());
  let kinds = cache.get(result.strings);
  if (!kinds) cache.set(result.strings, kinds = new Map());
  if (kinds.has(result.kind)) return kinds.get(result.kind);
  let markup = '';
  const names = new Map();
  for (let index = 0; index < result.values.length; index++) {
    markup += result.strings[index];
    const context = openingContext(markup);
    if (context.inTag) {
      const assignment = context.text.match(/([^\s<>="']+)\s*=\s*(?:["'][^"']*)?$/);
      if (assignment) {
        names.set(index, assignment[1]);
        markup += createMarker(index);
      } else {
        if (!/\s$/.test(markup) || context.quote) throw new Error('Dynamic tag names and attribute names are unsupported');
        markup += ` glint-ref-${index}="" `;
      }
    } else markup += createMarker(index);
  }
  markup += result.strings.at(-1);
  const template = doc.createElement('template');
  const wrapper = result.kind === 'svg' ? 'svg' : result.kind === 'mathml' ? 'math' : null;
  template.innerHTML = wrapper ? `<${wrapper}>${markup}</${wrapper}>` : markup;
  const root = wrapper ? template.content.firstElementChild?.firstElementChild : template.content.firstElementChild;
  const rawKey = root?.getAttribute('key') ?? null;
  const keyMarkers = rawKey === null ? [] : extractMarkers(rawKey);
  const keyIndex = keyMarkers.length === 1 && keyMarkers[0].full === rawKey
    ? keyMarkers[0].index
    : undefined;
  root?.removeAttribute('key');
  const plan = { template, wrapper, names, rawKey, keyIndex };
  kinds.set(result.kind, plan);
  return plan;
}
// Scan accumulated markup rather than just the most recent literal chunk.
function openingContext(markup) {
  let inTag = false;
  let quote = null;
  let start = 0;
  let comment = false;
  for (let i = 0; i < markup.length; i++) {
    const char = markup[i];
    if (comment) { if (markup.slice(i, i + 3) === '-->') { comment = false; i += 2; } continue; }
    if (!inTag && markup.slice(i, i + 4) === '<!--') { comment = true; i += 3; continue; }
    if (quote) { if (char === quote) quote = null; continue; }
    if (inTag && (char === '"' || char === "'")) quote = char;
    else if (char === '<') { inTag = true; start = i; }
    else if (char === '>') inTag = false;
  }
  return { inTag, quote, text: markup.slice(start) };
}
export function extractKey(result, doc) {
  const { rawKey, keyIndex } = analyzeTemplate(result, doc);
  return keyIndex === undefined ? rawKey ?? undefined : result.values[keyIndex];
}
