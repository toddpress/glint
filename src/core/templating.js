import { effect } from './reactivity.js'
import { eventListenersMap, removeAllEventListeners } from './event.js'
import { getCurrentComponent } from './lifecycle.js'
import { isSignalLike } from './utils.js'

const templateCache = new WeakMap();

export function css(strings, ...values) {
  const compiled = strings.reduce((acc, s, i) => acc + s + (values[i] || ''), '');
  const componentClass = getCurrentComponent()?.constructor;

  if (componentClass && !componentClass.styles.has(compiled)) {
    componentClass.styles.add(compiled);
  }

  return compiled;
}

function getOrCreateTemplate(strings) {
  if (templateCache.has(strings)) return templateCache.get(strings);

  const template = document.createElement('template');
  template.innerHTML = strings.reduce((acc, str, i) =>
    acc + str + (i < strings.length - 1 ? `{{${i}}}` : ''),
  '');

  templateCache.set(strings, template);
  return template;
}

function createExpressionFunction(val) {
  return isSignalLike(val) ? val : () => val;
}

function processTextNode(node, values) {
  const originalText = node.textContent;
  const matches = [...originalText.matchAll(/{{(\d+)}}/g)];

  if (matches.length === 0) return;

  const exprFns = matches.map(([, index]) =>
    createExpressionFunction(values[Number(index)])
  );

  effect(() => {
    const textContent = matches.reduce((text, match, i) =>
      text.replace(match[0], exprFns[i]() ?? ''), originalText);
    node.textContent = textContent;
  });
}

function processSingleAttribute(node, attr, values, listeners) {
  const { name, value: strValue } = attr;
  const match = strValue.match(/{{(\d+)}}/);

  if (!match) return;

  const value = values[Number(match[1])];

  if (name.startsWith('@')) {
      const event = name.slice(1);
      const listener = value;
      node.addEventListener(event, listener);
      listeners.push({ node, event, listener });
      node.removeAttribute(name);
  } else {
    const isPropertyBinding = name.startsWith(':');
    const exprFn = createExpressionFunction(value);

    const updateProp = function() {
      const prop = name.slice(1);
      node[prop] = exprFn();
      node.removeAttribute(name);
    }
    const updateAttribute = function() {
      node.setAttribute(name, exprFn() ?? '')
    }

    const effectFn = isPropertyBinding
      ? updateProp
      : updateAttribute;

    effect(effectFn)
  }
}

function processElementNode(node, values, listeners) {
  Array.from(node.attributes).forEach((attr) =>
    processSingleAttribute(node, attr, values, listeners)
  );
}

export function html(strings, ...values) {
  return (target) => {
    const template = getOrCreateTemplate(strings);
    const fragment = template.content.cloneNode(true);

    removeAllEventListeners(target);

    const listeners = [];
    const walker = document.createTreeWalker(
      fragment,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
    );

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeType === Node.TEXT_NODE) {
        processTextNode(node, values)
      }
      else if (node.nodeType === Node.ELEMENT_NODE) {
        processElementNode(node, values, listeners);
      }
    }

    eventListenersMap.set(target, listeners);
    target.replaceChildren(fragment);
  };
}
