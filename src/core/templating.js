import {
  isSignalLike,
  isFormElement,
  removeAllEventListeners,
  eventListenersMap,
} from './index.js'

const templateCache = new WeakMap();

/**
 * Tagged template function:
 *   html`<div>Count: ${count}</div>`
 * Returns a function that, given a target (shadowRoot), renders the resulting DOM.
 */
export function html(strings, ...values) {
  return function render(target) {
    let template = getOrCreateTemplate(strings);
    let fragment = template.content.cloneNode(true);

    removeAllEventListeners(target);
    const newListeners = [];

    const walker = document.createTreeWalker(
      fragment,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
    );

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeType === Node.TEXT_NODE) {
        processTextNode(node, values);
      } else if (
        node.nodeType === Node.ELEMENT_NODE
      ) {
        processElementNode(node, values, newListeners);
      }
    }

    eventListenersMap.set(target, newListeners);
    target.replaceChildren(fragment);
  };
}

function getOrCreateTemplate(strings) {
  if (templateCache.has(strings)) {
    return templateCache.get(strings);
  }
  const template = document.createElement('template');

  // Insert placeholders like {{0}}, {{1}}, etc.
  template.innerHTML = strings.reduce((acc, str, i) => {
    const isLastString = i < strings.length - 1
    return acc + str + (isLastString ? `{{${i}}}` : '');
  }, '');

  templateCache.set(strings, template);
  return template;
}

function processTextNode(node, values) {
  let textContent = node.textContent;
  const matches = [...textContent.matchAll(/{{(\d+)}}/g)];
  if (!matches.length) return;

  const originalText = textContent;
  const signalsToUpdate = [];

  function updateText() {
    let updated = originalText;
    for (const match of matches) {
      const placeholderIdx = Number(match[1]);
      const val = values[placeholderIdx];
      const replacement = isSignalLike(val) ? val.value : val ?? '';
      updated = updated.replace(match[0], replacement);
    }
    node.textContent = updated;
  }

  // Subscribe to signals if needed
  for (const match of matches) {
    const placeholderIdx = Number(match[1]);
    const val = values[placeholderIdx];
    if (isSignalLike(val)) {
      signalsToUpdate.push(val);
      val.subscribe(updateText);
    }
  }

  updateText();
}

function processElementNode(node, values, newListeners) {
  for (const attr of [...node.attributes]) {
    processAttribute(node, attr, values, newListeners);
  }
}

function processAttribute(node, attr, values, newListeners) {
  const match = attr.value.match(/{{(\d+)}}/);
  if (!match) return;

  const idx = Number(match[1]);
  const val = values[idx];
  const name = attr.name;

  if (name.startsWith('@')) {
    const eventName = name.slice(1);
    bindEvent(node, eventName, val, newListeners);
    node.removeAttribute(name);
  } else if (isSignalLike(val)) {
    // Two-way for inputs, or normal attribute updates
    bindSignal(node, name, val);
    node.removeAttribute(name);
  } else {
    node.setAttribute(name, val ?? '');
  }
}

function bindEvent(node, event, handler, listeners) {
  node.addEventListener(event, handler);
  listeners.push({ node, event, listener: handler });
}

function bindSignal(node, attrName, sig) {
  if (isFormElement(node)) {
    node.value = sig.value;
    const updateSignal = (e) => (sig.value = e.target.value);
    node.addEventListener('input', updateSignal);
    sig.subscribe((v) => (node.value = v));
  } else {
    // Otherwise, just treat it as a normal attribute
    const updateAttr = (newVal) => {
      node.setAttribute(attrName, newVal ?? '');
    };

    updateAttr(sig.value);
    sig.subscribe(updateAttr);
  }
}
