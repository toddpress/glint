// === templating.js ===
import { effect } from './reactivity.js';
import { eventListenersMap, removeAllEventListeners } from './event.js';
import { getCurrentComponent } from './lifecycle.js';
import { isSignalLike, isFunction } from './utils.js';

const templateCache = new WeakMap();

export const css = (strings, ...values) => {
  const compiled = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');
  const compClass = getCurrentComponent()?.constructor;
  compClass?.styles.add(compiled);
  return compiled;
};

const getTemplateFromStrings = (strings) =>
  templateCache.get(strings) ||
  (() => {
    const template = document.createElement('template');
    template.innerHTML = strings.reduce((acc, str, i) =>
      acc + str + (i < strings.length - 1 ? `{{${i}}}` : ''), '');
    templateCache.set(strings, template);
    return template;
  })();

const createExpressionFn = val => isSignalLike(val) ? val : () => val;

const interpolateText = (text, exprFns, matchTokens) =>
  matchTokens.reduce((out, token, i) => out.replace(token[0], exprFns[i]() ?? ''), text);

const processTextNode = (node, values) => {
  const original = node.textContent;
  const matches = [...original.matchAll(/{{(\d+)}}/g)];
  if (!matches.length) return;

  const exprFns = matches.map(([, i]) => createExpressionFn(values[+i]));

  effect(() => {
    node.textContent = interpolateText(original, exprFns, matches);
  });
};

const processAttribute = (node, attr, values, listeners) => {
  const { name, value: str } = attr;
  const match = str.match(/{{(\d+)}}/);
  if (!match) return;

  const val = values[+match[1]];
  const expr = createExpressionFn(val);

  const cleanAttr = () => node.removeAttribute(name);

  if (name.startsWith('@')) {
    const event = name.slice(1);
    node.addEventListener(event, val);
    listeners.push({ node, event, listener: val });
    cleanAttr();
  } else {
    const isProp = name.startsWith(':');
    const prop = isProp ? name.slice(1) : name;

    effect(() => {
      const result = expr();
      isProp ? (node[prop] = result) : node.setAttribute(prop, result ?? '');
      cleanAttr();
    });
  }
};

const processElementNode = (node, values, listeners) =>
  [...node.attributes].forEach(attr =>
    processAttribute(node, attr, values, listeners)
  );

const walkAndBind = (frag, values, target) => {
  const listeners = [];
  const walker = document.createTreeWalker(frag, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    node.nodeType === Node.TEXT_NODE
      ? processTextNode(node, values)
      : processElementNode(node, values, listeners);
  }
  eventListenersMap.set(target, listeners);
};

export const html = (strings, ...values) => (target) => {
  const frag = getTemplateFromStrings(strings).content.cloneNode(true);
  removeAllEventListeners(target);
  walkAndBind(frag, values, target);
  target.replaceChildren(frag);
};
