import { effect } from './reactivity.js'
import { eventListenersMap, removeAllEventListeners } from './event.js'
import { getCurrentComponent } from './lifecycle.js'
import { isSignalLike } from './utils.js'
import { componentRegistry, componentPathRegistry, loadComponent } from './component.js'

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
  // Process attributes
  Array.from(node.attributes).forEach((attr) =>
    processSingleAttribute(node, attr, values, listeners)
  );

  // Check if this is a custom element that needs to be lazy loaded
  const tagName = node.tagName.toLowerCase();
  if (tagName.includes('-') && !customElements.get(tagName)) {
    handleUnregisteredComponent(tagName);
  }

  // Process child elements recursively
  Array.from(node.children).forEach(child => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const childTagName = child.tagName.toLowerCase();
      if (childTagName.includes('-') && !customElements.get(childTagName)) {
        handleUnregisteredComponent(childTagName);
      }
    }
  });
}

/**
 * Handle an unregistered component by attempting to load it
 * @param {string} tagName - The tag name of the component
 */
function handleUnregisteredComponent(tagName) {
  // Check if the component is in either registry
  const isInRegistry = componentRegistry.has(tagName);
  const isInPathRegistry = componentPathRegistry.has(tagName);

  if (!isInRegistry && !isInPathRegistry) {
    console.warn(`Unknown component: ${tagName}. Make sure it's registered with component() or lazyComponent().`);
    return;
  }

  if (isInRegistry) {
    // Component is in the registry but not registered with customElements yet
    // This will be handled by registerAllComponents() in render()
    return;
  }

  if (isInPathRegistry) {
    // We'll use the actual tag name but mark it as loading
    // The element will be created with the PlaceholderComponent class
    // which adds the data-loading attribute

    // Start loading the component (registration will happen automatically in the placeholder's connectedCallback)
    loadComponent(tagName).catch(error => {
      console.error(`Failed to load component ${tagName}:`, error);
    });
  }
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

    // First pass: process text nodes and attributes
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
