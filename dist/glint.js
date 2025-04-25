/**
 * Glint ✨
 * A lightweight custom-element framework with signals, computed values, and more.
 *
 * @example:
 *
 * ```javascript
 * const Counter = component('tsp-counter', ({ start = 0 }) => {
 *   const count = signal(Number(start));
 *   const doubleCount = computed(() => count() * 2);
 *
 *   function increment() {
 *     count(count() + 1);
 *   }
 *
 *   onMount(() => {
 *     console.log('[Counter] - component mounted');
 *   });
 *
 *   onDestroy(() => {
 *     console.log('[Counter] - component unmounted');
 *   });
 *
 *   effect(() => {
 *     console.log('[Counter] - count changed:', count());
 *   });
 *
 *   return html`
 *     <button @click=${() => count(count() + 1)}>Count: ${count}</button>
 *     <p>Double: ${doubleCount}</p>
 *   `;
 * });
 *
 */

// ------------------------------
//          COMPONENT
// ------------------------------

export const componentRegistry = new Map();

export function component(
  name,
  renderer,
  options,
) {
    if (!/^[a-z][a-z0-9]*-[a-z0-9-]+$/.test(name))
        throw new Error(`Invalid custom element name: '${name}'.`);
    componentRegistry.set(name, { renderer, options });
}

const getDefaultBaseComponentOptions = (partial = {}) => ({
  useShadow: true,
  ...partial
})
class BaseComponent extends HTMLElement {
  // Use Map to store CSSStyleSheet objects (key: cssText, value: CSSStyleSheet)
  static styleSheets = new Map();
  // Fallback for browsers without Constructed Stylesheets support
  static styles = new Set();
  // Store link hrefs
  static styleLinks = new Set();
  static renderer = () => () => {};
  static options = {}

  props = {};
  hooks = { onMount: [], onDestroy: [] };

  #uuid = generateUuid();
  #renderScheduled = false;

  _getDefaultOptions = (partial = {}) => ({
    useShadow: true,
    ...partial
  })
  constructor() {
      super();

      const { useShadow } = this._getDefaultOptions(this.constructor.options);

      this.effectsCleanupFns = [];
      this.dataset.id = this._getTaggedUuid();

      this._root = useShadow
        ? this.attachShadow({ mode: 'open' })
        : this;
      this._initPropsFromAttributes();
      this.mutationObserver = new MutationObserver(this.onAttributesChanged);
      this.mutationObserver.observe(this, {
          attributes: true,
          attributeOldValue: true,
      });
  }

  connectedCallback() {
      this._scheduleRender();
      queueMicrotask(() => {
          this._applyStyles();
          this.hooks.onMount.forEach((fn) => fn());
      });
  }

  disconnectedCallback() {
      this.mutationObserver.disconnect();
      removeAllEventListeners(this._root);
      this.hooks.onDestroy.forEach((fn) => fn());
      this.effectsCleanupFns.forEach((fn) => fn());
      this.effectsCleanupFns = [];
  }

  _getTaggedUuid = (tag) => [
      this.constructor.name,
      tag,
      this.#uuid
    ].filter(Boolean).join('_');

  _applyStyles = () => {
      const constructor = this.constructor;

      // Try to use Constructed Stylesheets for shadow root if supported
      if (this._root instanceof ShadowRoot && 'adoptedStyleSheets' in this._root) {
          // Apply constructed stylesheets to shadow root
          if (constructor.styleSheets.size) {
              try {
                  this._root.adoptedStyleSheets = [
                      ...this._root.adoptedStyleSheets || [],
                      ...Array.from(constructor.styleSheets.values())
                  ];
              } catch (e) {
                  console.warn('Error applying adoptedStyleSheets:', e);
                  // Fall back to traditional style elements
                  this._applyStylesFallback();
              }
          }
      } else {
          // Fallback for browsers without adoptedStyleSheets support
          this._applyStylesFallback();
      }

      // Apply style links to shadow root
      constructor.styleLinks.forEach(href => {
          const linkTag = document.createElement('link');
          linkTag.rel = 'stylesheet';
          linkTag.href = href;
          linkTag.dataset.styleId = this._getTaggedUuid('link');
          this._root.appendChild(linkTag);
      });
  };

  _applyStylesFallback = () => {
      const constructor = this.constructor;
      if (!constructor.styles.size) return;

      const styleTag = document.createElement('style');
      styleTag.dataset.styleId = this._getTaggedUuid('style');
      styleTag.textContent = [...constructor.styles].join('\n\n');
      this._root.appendChild(styleTag);
  };

  _initPropsFromAttributes() {
      for (const { name, value } of this.attributes) {
          this._setReactiveProp(name, safeParse(value));
      }
  }

  onAttributesChanged = (mutations) => {
      for (const { attributeName, oldValue } of mutations) {
          const newValue = this.getAttribute(attributeName);
          if (oldValue === newValue) continue;
          this._setReactiveProp(attributeName, safeParse(newValue));
      }
  };

  _setReactiveProp = (name, value) => {
      if (!this.props[name]) {
          this.props[name] = signal(value);
          this.props[name].subscribe(this._scheduleRender);
      } else {
          this.props[name](value);
      }
  };

  _scheduleRender = () => {
      if (this.renderScheduled) return;
      this.renderScheduled = true;
      queueMicrotask(() => {
          this.renderScheduled = false;
          if (!this.isConnected) return;
          this._render();
      });
  };

  _render = () => {
      pushCurrentComponent(this);

      const _props = Object.entries(this.props)
        .reduce((acc, [key, sig]) => {
          acc[key] = sig();
          return acc;
        }, {});

      const renderFn = this.constructor.renderer(_props);

      if (isFunction(renderFn)) renderFn(this._root);

      popCurrentComponent();
  };
}

export function registerAllComponents() {
    componentRegistry.forEach(({ renderer, options }, name) => {
        if (!customElements.get(name)) registerComponent(name, renderer, options);
    });
}

export function registerComponent(
  name,
  renderer,
  options,
) {
    if (customElements.get(name)) return;
    const entry = componentRegistry.get(name);
    if (!entry)
        throw new Error(`Component ${name} is not defined in the registry.`);

    customElements.define(
        name,
        class extends BaseComponent {
          static renderer = renderer;
          static options = options;
        }
    );
}

export function render(
    AppComponent,
    { autoRegister = true, rootNode = document.body } = {},
) {
    if (autoRegister) registerAllComponents();
    const RootComponent = AppComponent();
    if (isFunction(RootComponent)) RootComponent(rootNode);
}

// -------------------------------------
//               EVENTS
// -------------------------------------

const eventListenersMap = new WeakMap();

function removeAllEventListeners(node) {
    if (!node || !eventListenersMap.has(node)) return;

    const allNodes = [node, ...node.querySelectorAll('*')];
    allNodes.forEach((el) => {
        const listeners = eventListenersMap.get(el) || [];
        listeners.forEach(({ event, listener }) =>
            el.removeEventListener(event, listener),
        );
        eventListenersMap.delete(el);
    });
}

// -------------------------------
//          TEMPLATING
// -------------------------------

const templateCache = new WeakMap();

function css(strings, ...values) {
  const compiled = strings.reduce((acc, s, i) => acc + s + (values[i] || ''), '');
  const componentClass = getCurrentComponent()?.constructor;

  if (!componentClass) return compiled;

  // Create a temporary div to parse the HTML content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = compiled.trim();

  // Process each child node
  Array.from(tempDiv.childNodes).forEach(node => {
    // Handle <style> tags
    if (node.nodeName === 'STYLE') {
      const styleContent = node.textContent;

      // Try to create a CSSStyleSheet if supported
      if (window.CSSStyleSheet && 'replaceSync' in CSSStyleSheet.prototype) {
        try {
          // Only create if we don't already have this style
          if (!componentClass.styleSheets.has(styleContent)) {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(styleContent);
            componentClass.styleSheets.set(styleContent, sheet);
          }
        } catch (e) {
          console.warn('Error creating CSSStyleSheet:', e);
          // Fall back to traditional style elements
          if (!componentClass.styles.has(styleContent)) {
            componentClass.styles.add(styleContent);
          }
        }
      } else {
        // Fallback for browsers without Constructed Stylesheets
        if (!componentClass.styles.has(styleContent)) {
          componentClass.styles.add(styleContent);
        }
      }
    }
    // Handle <link> tags
    else if (node.nodeName === 'LINK' && node.getAttribute('rel') === 'stylesheet') {
      const href = node.getAttribute('href');
      if (href) {
        componentClass.styleLinks.add(href);
      }
    }
    // Handle plain CSS text (legacy support)
    else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      const cssText = node.textContent.trim();
      if (cssText) {
        // Try to create a CSSStyleSheet if supported
        if (window.CSSStyleSheet && 'replaceSync' in CSSStyleSheet.prototype) {
          try {
            if (!componentClass.styleSheets.has(cssText)) {
              const sheet = new CSSStyleSheet();
              sheet.replaceSync(cssText);
              componentClass.styleSheets.set(cssText, sheet);
            }
          } catch (e) {
            console.warn('Error creating CSSStyleSheet:', e);
            // Fall back to traditional style elements
            if (!componentClass.styles.has(cssText)) {
              componentClass.styles.add(cssText);
            }
          }
        } else {
          // Fallback for browsers without Constructed Stylesheets
          if (!componentClass.styles.has(cssText)) {
            componentClass.styles.add(cssText);
          }
        }
      }
    }
  });

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

// `createExprFn` returns a function closure over a value; in our case, that of a
//  template expression.
const createExprFn = (val) => isSignalLike(val) ? val : () => val;

function processTextNode(node, values) {
  const originalText = node.textContent;
  const matches = [...originalText.matchAll(/{{(\d+)}}/g)];

  if (matches.length === 0) return;

  const exprFns = matches.map(([, match]) => {
    const tplIndex = Number(match);
    return createExprFn(values[tplIndex]);
  });

  effect(() => {
    node.textContent = matches.reduce((text, match, i) => {
      return text.replace(match[0], exprFns[i]() ?? '')
    }, originalText);;
  });
}

function processSingleAttribute(node, attr, values, listeners) {
  const name = attr.name;
  const match = attr.value.match(/{{(\d+)}}/);

  if (!match) return;

  const tplIndex = Number(match[1]);
  const value = values[tplIndex];

  if (name.startsWith('@')) {
      const event = name.slice(1);
      const listener = value;
      node.addEventListener(event, listener);
      listeners.push({ node, event, listener });
      node.removeAttribute(name);
  } else {
    const isPropertyBinding = name.startsWith(':');
    const exprFn = createExprFn(value);

    function updateProp() {
      const prop = name.slice(1);
      node[prop] = exprFn();
      node.removeAttribute(name);
    }

    function updateAttr() {
      node.setAttribute(name, exprFn() ?? '')
    }

    const effectFn = isPropertyBinding
      ? updateProp
      : updateAttr;

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

// -------------------------------
//          REACTIVITY
// -------------------------------

let activeSubscriber = null;

export function createSignalAccessor(initialValue, onSet) {
  let value = initialValue;
  const subscribers = new Set();

  function _setValue(newValue) {
    if (Object.is(value, newValue)) return;
    value = newValue;
    subscribers.forEach((fn) => fn(value));
  }

  const defaultOnSet = (newValue, setValue) => {
    setValue(newValue);
  };

  function set(newValue) {
    const _onSet = onSet || defaultOnSet;
    _onSet(newValue, _setValue);
  }

  function get() {
    if (activeSubscriber) {
      subscribers.add(activeSubscriber);
    }
    return value;
  }

  function subscribe(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }

  function accessor(newValue) {
    return arguments.length === 0 ? get() : set(newValue);
  }

  accessor.subscribe = subscribe;

  return accessor;
}

export function withTracking(fn, subscriber) {
  activeSubscriber = subscriber;
  const result = fn();
  activeSubscriber = null;
  return result;
}

export function signal(initialValue) {
  return createSignalAccessor(initialValue);
}

export function computed(fn) {
  const accessor = signal(fn());
  function update() {
    withTracking(() => accessor(fn()), update);
  }
  update();
  return accessor;
}

export function effect(fn) {
  const comp = getCurrentComponent();
  if (!comp) return;
  function run() {
    const cleanup = withTracking(fn, run);
    if (!isFunction(cleanup)) return;
    comp.effectsCleanupFns.push(cleanup);
  }
  run();
}

export function debouncedSignal(
  initialValue,
  delay = 300,
  options = { leading: false, trailing: true }
) {
  const debouncedSetter = debounce((val, setter) => setter(val), delay, options);
  return createSignalAccessor(initialValue, debouncedSetter);
}


// -------------------------------
//           LIFECYCLE
// -------------------------------

let _currentComponentStack = [];
const getCurrentComponent = () => _currentComponentStack.at(-1);
const pushCurrentComponent = (comp) => _currentComponentStack.push(comp);
const popCurrentComponent = () => _currentComponentStack.pop();

// export
function onMount(cb) {
    const comp = getCurrentComponent();
    if (comp) comp.hooks.onMount.push(cb);
}

// export
function onDestroy(cb) {
    const comp = getCurrentComponent();
    if (comp) comp.hooks.onDestroy.push(cb);
}

// ------------------------------------
//             UTILITIES
// ------------------------------------

export const isSignalLike = (obj) =>
    isFunction(obj) && isFunction(obj.subscribe);

export function safeParse(str) {
    if (typeof str !== 'string') return str;
    const JSON_LIKE =
        /^\s*(?:\{|\[|'(?:\\.|[^'])*'|true|false|null|-?\d+(?:\.\d+)?)\s*$/;
    try {
        return JSON_LIKE.test(str) ? JSON.parse(str) : str;
    } catch {
        return str;
    }
}

export function debounce(fn, delay, { leading = false, trailing = true } = {}) {
    let timeout, lastArgs, lastThis, result;
    return function (...args) {
        lastArgs = args;
        lastThis = this;
        const shouldCallNow = leading && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            timeout = null;
            if (trailing && lastArgs) {
                result = fn.apply(lastThis, lastArgs);
                lastArgs = lastThis = null;
            }
        }, delay);
        if (shouldCallNow) {
            result = fn.apply(lastThis, lastArgs);
            lastArgs = lastThis = null;
        }
        return result;
    };
}

export const generateUuid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

export const isFunction = (value) => typeof value === 'function';

export function isGlintComponent(node) {
    if (!(node instanceof HTMLElement)) return false;
    const tagName = node.tagName.toLowerCase();
    return customElements.get(tagName) && componentRegistry.has(tagName);
}

// ------------------------------------
//              EXAMPLE
// ------------------------------------

// export
const DelayedInput = component('tsp-delayed-input', () => {
    const delayedText = debouncedSignal(' ', 1000);

    function setDelayedText(e) {
        const text = e?.target?.value ?? ''
        delayedText(text);
    }

    onMount(() => {
        console.log('[DelayedInput] - component mounted');
    });

    onDestroy(() => {
        console.log('[DelayedInput] - component unmounted');
    });

    effect(() => {
        console.log('[DelayedInput] - text changed:', delayedText());
    });

    return html`
        <input
          type="text"
          :value=${delayedText}
          @input="${setDelayedText}"
        />
        <pre>${delayedText}</pre>
    `;
});

// export
const Counter = component('tsp-counter', ({ start = 0 }) => {
    const count = signal(Number(start));
    const doubleCount = computed(() => count() * 2);

    function incrementCount() {
        count(count() + 1);
    }

    onMount(() => {
        console.log('[Counter] - component mounted');
    });

    onDestroy(() => {
        console.log('[Counter] - component unmounted');
    });

    effect(() => {
        console.log('[Counter] - count changed:', count());

        return () => {
            console.log('[Counter] - cleanup running');
        };
    });

    css`
        button.btn {
            background-color: #08c;
            color: #fff;
            border: none;
            padding: 0.4rem 0.8rem;
        }
    `;

    return html`
        <button class="btn" @click=${incrementCount}>Count: ${count}</button>
        <p>Double: ${doubleCount}</p>
    `;
});

const App = () => html`
    <section>
        <h3 class="text-lg">Updates:</h3>
        <ul class="px-4 py-2">
            <li>✅ Revamp reactivity</li>
            <li>☑️ support <code>&lt;style&gt;</code> &amp; <code>&lt;style global&gt;</code> in <code>css</code> helper</li>
            <li>☑️ support <code>&lt;link&gt;</code> in <code>css</code> helper</li>
        </ul>
    </section>
    <hr />
    <section>
        <h3 class="text-lg py-2">Signals, Computed, Effects</h3>
        <tsp-counter start="5" />
    </section>
    <section>
        <h3>Debounced Signal (1 second):</h3>
        <tsp-delayed-input />
    </section>
`;

//? NOTE - only wrapped in DOMContentLoaded event listener
//? NOTE -> due to codepen being codepen.
document.addEventListener('DOMContentLoaded', () => {
    const rootNode = document.querySelector('#glint-app');
    render(App, { autoRegister: true, rootNode });
});
