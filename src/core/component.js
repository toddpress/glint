// === component.js ===
import { removeAllEventListeners } from './event.js';
import {
  pushCurrentComponent,
  popCurrentComponent,
} from './lifecycle.js';
import { signal } from './reactivity.js';
import {
  generateUuid,
  safeParse,
  isFunction
} from './utils.js';
import { getLazyLoaderForTag } from './lazy.js';

export const componentRegistry = new Map();

export const component = (tag, renderer, options = {}) => {
  if (!/^[a-z][a-z0-9]*-[a-z0-9-]+$/.test(tag)) {
    throw new Error(`Invalid custom element tag name: '${tag}'`);
  }
  if (!isFunction(renderer)) {
    throw new Error(`Renderer must be a function.`);
  }

  registerComponent(tag, renderer, options);
  return renderer;
};

export const registerComponent = (tag, renderer, options) => {
  componentRegistry.set(tag, { renderer, options });

  const existing = customElements.get(tag);
  const isRealComponent = existing?.prototype instanceof GlintComponent;
  if (!existing || !isRealComponent) {
    // Define placeholder if undefined or still pointing to placeholder
    customElements.define(tag, GlintLazyPlaceholder);
  }
};

export const registerAllComponents = () =>
  [...componentRegistry.entries()]
    .filter(([tag]) => !customElements.get(tag))
    .forEach(([tag, { renderer, options }]) =>
      registerComponent(tag, renderer, options)
    );

export const render = (App, { lazyRegister = false, rootNode = document.body } = {}) => {
  (lazyRegister ? enableLazyRegistration : registerAllComponents)();
  const Root = App();
  isFunction(Root) && Root(rootNode);
};

const enableLazyRegistration = () =>
  [...componentRegistry.keys()]
    .filter((tag) => !customElements.get(tag))
    .forEach((tag) => customElements.define(tag, GlintLazyPlaceholder));

// === Core Component Base Class ===
class GlintComponent extends HTMLElement {
  static styles = new Set();
  static renderer = () => () => {};
  static options = {};

  props = {};
  hooks = { onMount: [], onDestroy: [] };

  #uuid = generateUuid();
  #renderScheduled = false;

  constructor() {
    super();
    const { useShadow = true } = this.constructor.options;
    this.dataset.id = this._getTaggedUuid();
    this._root = useShadow ? this.attachShadow({ mode: 'open' }) : this;
    this.effectsCleanupFns = [];
    this._initPropsFromAttributes();
    this._observeAttributes();
  }

  connectedCallback() {
    this._scheduleRender();
    queueMicrotask(() => {
      this._applyStyles();
      this.hooks.onMount.forEach(fn => fn());
    });
  }

  disconnectedCallback() {
    this.mutationObserver.disconnect();
    removeAllEventListeners(this._root);
    this.hooks.onDestroy.forEach(fn => fn());
    this.effectsCleanupFns.forEach(fn => fn());
    this.effectsCleanupFns = [];
  }

  _getTaggedUuid = (tag) => [this.tagName.toLowerCase(), tag, this.#uuid].filter(Boolean).join('_');

  _applyStyles = () => {
    if (!this.constructor.styles.size) return;
    const style = Object.assign(document.createElement('style'), {
      type: 'text/css',
      textContent: [...this.constructor.styles].join('\n\n'),
      dataset: { styleId: this._getTaggedUuid('style') }
    });
    this._root.appendChild(style);
  };

  _observeAttributes = () => {
    this.mutationObserver = new MutationObserver(this._onAttrChange);
    this.mutationObserver.observe(this, { attributes: true, attributeOldValue: true });
  };

  _onAttrChange = (mutations) =>
    mutations.forEach(({ attributeName, oldValue }) => {
      const newValue = this.getAttribute(attributeName);
      if (newValue !== oldValue) {
        this._setReactiveProp(attributeName, safeParse(newValue));
      }
    });

  _initPropsFromAttributes = () =>
    [...this.attributes].forEach(({ name, value }) =>
      this._setReactiveProp(name, safeParse(value))
    );

  _setReactiveProp = (name, value) => {
    const prop = this.props[name] ||= signal(value);
    prop(value);
    prop.subscribe(this._scheduleRender);
  };

  _scheduleRender = () => {
    if (this.renderScheduled) return;
    this.renderScheduled = true;
    queueMicrotask(() => {
      this.renderScheduled = false;
      this.isConnected && this._render();
    });
  };

  _render = () => {
    pushCurrentComponent(this);
    const props = Object.fromEntries(
      Object.entries(this.props).map(([k, s]) => [k, s()])
    );
    const view = this.constructor.renderer(props);
    isFunction(view) && view(this._root);
    popCurrentComponent();
  };
}

// === Self-Replacing Placeholder ===
class GlintLazyPlaceholder extends HTMLElement {
  async connectedCallback() {
    const tag = this.tagName.toLowerCase();

    const entry = componentRegistry.get(tag);
    if (!customElements.get(tag) || customElements.get(tag) === GlintLazyPlaceholder) {
      if (!entry) {
        const loader = getLazyLoaderForTag(tag);
        const mod = await loader?.().catch(() => null);
        const exported = mod?.default ?? mod?.[Object.keys(mod)[0]];
        if (!isFunction(exported)) return;
        // exported must call `component()` which will populate componentRegistry
      }

      const { renderer, options } = componentRegistry.get(tag);
      customElements.define(tag, class extends GlintComponent {
        static renderer = renderer;
        static options = options;
      });
    }

    const real = document.createElement(tag);
    [...this.attributes].forEach(attr => real.setAttribute(attr.name, attr.value));
    real.append(...this.childNodes);
    this.replaceWith(real);
  }
}
