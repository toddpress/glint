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


export const componentRegistry = new Map();

export function define(
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
  static styles = new Set();
  static renderer = () => () => {};
  static options = {}

  props = {};
  hooks = { onMount: [], onDestroy: [] };

  #uuid = generateUuid();
  #renderScheduled = false;

  constructor() {
      super();

      const {
        useShadow,
        ...rest
      } = getDefaultBaseComponentOptions(this.constructor.options);

      this.effectsCleanupFns = [];
      this.dataset.id = this.#getTaggedUuid();

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

  #getTaggedUuid = (tag) => [
      name,
      tag,
      this.#uuid
    ].filter(Boolean).join('_');

  _applyStyles = () => {
      if (!this.constructor.styles.size) return;
      const tag = document.createElement('style');
      tag.type = 'text/css';
      tag.dataset.styleId = this.#getTaggedUuid('style');
      tag.textContent = [...this.constructor.styles].join('\n\n');
      this._root.appendChild(tag);
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
      if (this.#renderScheduled) return;
      this.#renderScheduled = true;
      queueMicrotask(() => {
          this.#renderScheduled = false;
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
