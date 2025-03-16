import {
  removeAllEventListeners,
  pushCurrentComponent,
  popCurrentComponent,

  signal,

  isSignalLike,
  safeParse,
  isFunction
} from './index.js';

export const componentRegistry = new Map();

export function component(name, renderer) {
  if (!/^[a-z][a-z0-9]*-[a-z0-9-]+$/.test(name)) {
    throw new Error(`Invalid custom element name: '${name}'.`);
  }

  componentRegistry.set(name, renderer);
}

export function registerAllComponents() {
  componentRegistry.forEach((renderer, name) => {
    if (customElements.get(name)) return;
    registerComponent(name, renderer);
  });
}

export function registerComponent(name) {
  if (customElements.get(name)) return;

  const renderer = componentRegistry.get(name);
  if (!renderer) {
    throw new Error(
      `Component ${name} is not defined in the component registry.`
    );
  }

  class CustomElement extends HTMLElement {
    constructor() {
      super();

      this.props = {};

      /** Used to avoid multiple renders in the same microtask. */
      this._renderScheduled = false;

      this.hooks = {
        onMount: [],
        onDestroy: []
      };

      this.effectsCleanupFns = [];

      this._mutationObserver = new MutationObserver(this._onAttributesChanged);

      this.attachShadow({ mode: 'open' });

      this._initPropsFromAttributes();

      this._mutationObserver.observe(this, {
        attributes: true,
        attributeOldValue: true
      });
    }

    connectedCallback() {
      this._scheduleRender();

      queueMicrotask(() => {
        this.hooks.onMount.forEach((fn) => fn());
      });
    }

    disconnectedCallback() {
      this._mutationObserver.disconnect();

      removeAllEventListeners(this.shadowRoot);

      this.hooks.onDestroy.forEach((fn) => fn());

      this.effectsCleanupFns.forEach((fn) => fn());
      this.effectsCleanupFns = [];
    }

    // ------------------------------
    //    INTERNAL UTILS, RENDER
    // ------------------------------

    _initPropsFromAttributes() {
      for (const { name, value } of this.attributes) {
        this._setReactiveProp(name, safeParse(value));
      }
    }

    _onAttributesChanged = (mutations) => {
      for (const { attributeName, oldValue } of mutations) {
        const newValue = this.getAttribute(attributeName);
        if (oldValue !== newValue) {
          this._setReactiveProp(attributeName, safeParse(newValue));
        }
      }
    };

    _setReactiveProp(name, value) {
      if (!this.props[name]) {
        this.props[name] = isSignalLike(value) ? value : signal(value)
        this.props[name].subscribe(this._scheduleRender);
      } else {
        this.props[name].value = isSignalLike(value) ? value.value : value;
      }
    }

    _scheduleRender() {
      if (this._renderScheduled) return;
      this._renderScheduled = true;

      queueMicrotask(() => {
        this._renderScheduled = false;
        if (!this.isConnected) return;
        this._render();
      });
    }

    _render() {
      pushCurrentComponent(this);

      // Pass a plain object { attrName: propValue, … } to the renderer
      const propsObj = {};
      for (const [key, sig] of Object.entries(this.props)) {
        propsObj[key] = sig.value;
      }

      const renderFn = renderer(propsObj);
      if (typeof renderFn === 'function') {
        renderFn(this.shadowRoot);
      }

      popCurrentComponent();
    }
  }

  customElements.define(name, CustomElement);
}

export function render(
  AppComponent,
  {
    autoRegister = true,
    rootNode = document.body
  } = {}
) {
  if (autoRegister) {
    registerAllComponents();
  }

  // Create and mount the root app component
  const RootComponent = AppComponent();
  if (isFunction(RootComponent)) {
    RootComponent(rootNode);
  }
}
