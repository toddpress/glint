import { removeAllEventListeners } from './event.js';

import {
    pushCurrentComponent,
    popCurrentComponent,
} from './lifecycle.js';

import { signal } from './reactivity.js';

import {
    generateUuid,
    safeParse,
    isFunction,
    toTagName
} from './utils.js';


export const componentRegistry = new Map();

// Registry to map component names to their module paths for lazy loading
export const componentPathRegistry = new Map();

// Registry to track components that are currently being loaded
// This is used to prevent duplicate import operations for the same component
// and to provide access to the loading promises
const loadingComponents = new Map();

// Registry to track components that have been loaded but not yet registered
// This allows for separating the loading and registration steps
const loadedComponents = new Map();

/**
 * Register a component with Glint
 * @param {string|function} nameOrRenderer - Either the component name or the renderer function
 * @param {function|object} rendererOrOptions - Either the renderer function or options
 * @param {object} [options] - Component options
 * @returns {function} The renderer function (for use with default exports)
 */
export function component(
  nameOrRenderer,
  rendererOrOptions,
  optionsArg,
) {
    let name, renderer, options;

    // Handle different call signatures
    if (typeof nameOrRenderer === 'function') {
        // Auto-naming: component(renderer, options)
        renderer = nameOrRenderer;
        options = rendererOrOptions || {};

        // Get the function name and convert it to a tag name
        const fnName = renderer.name;
        name = toTagName(fnName);

        if (!name) {
            throw new Error(`Could not auto-generate tag name from function name '${fnName}'. ` +
                          `Please provide an explicit tag name or use a named function.`);
        }
    } else {
        // Traditional: component(name, renderer, options)
        name = nameOrRenderer;
        renderer = rendererOrOptions;
        options = optionsArg || {};

        if (typeof renderer !== 'function') {
            throw new Error(`Renderer must be a function, got ${typeof renderer}`);
        }
    }

    // Validate the tag name
    if (!/^[a-z][a-z0-9]*-[a-z0-9-]+$/.test(name)) {
        throw new Error(`Invalid custom element name: '${name}'.`);
    }

    // Register the component
    componentRegistry.set(name, { renderer, options });

    // Return the renderer for use with default exports
    return renderer;
}

/**
 * Register a component for lazy loading
 * @param {string|function} nameOrPath - Either the component name or the path to the module
 * @param {string|object} pathOrOptions - Either the path to the module or options
 * @param {Object} [options] - Component options
 */
export function lazyComponent(nameOrPath, pathOrOptions, optionsArg = {}) {
    let name, path, options;

    // Handle different call signatures
    if (typeof nameOrPath === 'string' && nameOrPath.includes('/')) {
        // Auto-naming: lazyComponent(path, options)
        path = nameOrPath;
        options = pathOrOptions || {};

        // Extract component name from the path
        // e.g., './components/UserProfile.js' -> 'UserProfile'
        const fileName = path.split('/').pop().split('.')[0];
        name = toTagName(fileName);

        if (!name) {
            throw new Error(`Could not auto-generate tag name from file name '${fileName}'. ` +
                          `Please provide an explicit tag name.`);
        }
    } else {
        // Traditional: lazyComponent(name, path, options)
        name = nameOrPath;
        path = pathOrOptions;
        options = optionsArg || {};

        if (typeof path !== 'string') {
            throw new Error(`Path must be a string, got ${typeof path}`);
        }
    }

    // Validate the tag name
    if (!/^[a-z][a-z0-9]*-[a-z0-9-]+$/.test(name)) {
        throw new Error(`Invalid custom element name: '${name}'.`);
    }

    // Register the component path
    componentPathRegistry.set(name, { path, options });

    // Return the tag name for reference
    return name;
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

  // Private fields
  _uuid = generateUuid();
  _renderScheduled = false;

  constructor() {
      super();

      const {
        useShadow,
      } = getDefaultBaseComponentOptions(this.constructor.options);

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
      this.tagName?.toLowerCase(),
      tag,
      this._uuid
    ].filter(Boolean).join('_');

  _applyStyles = () => {
      if (!this.constructor.styles.size) return;
      const styleTag = document.createElement('style');
      styleTag.dataset.styleId = this._getTaggedUuid('style');
      styleTag.textContent = [...this.constructor.styles].join('\n\n');
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
      if (this._renderScheduled) return;
      this._renderScheduled = true;
      queueMicrotask(() => {
          this._renderScheduled = false;
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

/**
 * Minimal placeholder component that serves as a temporary replacement while the real component is loading
 * No visual indication is shown - it's just a marker element with a data-loading attribute
 */
class PlaceholderComponent extends HTMLElement {
    constructor() {
        super();

        // Mark this as a placeholder component
        this.__placeholder = true;

        // Add a data-loading attribute for easy querying
        this.setAttribute('data-loading', 'true');
    }

    /**
     * Called when the element is connected to the DOM
     * Automatically starts loading the component if it's not already loaded
     */
    connectedCallback() {
        // Get the component name from the tag name
        const name = this.tagName.toLowerCase();

        // Start loading the component if it's not already loaded
        if (componentPathRegistry.has(name) && !loadedComponents.has(name)) {
            // Load the component but don't register it yet
            loadComponent(name)
                .then(() => {
                    // Register the component
                    registerLoadedComponent(name);
                })
                .catch(error => {
                    console.error(`Failed to load component ${name}:`, error);
                });
        }
    }
}

/**
 * Load a component module without registering it
 * @param {string} name - The component name
 * @returns {Promise} - A promise that resolves when the component is loaded
 */
export async function loadComponent(name) {
    // If the component is already registered, return immediately
    if (customElements.get(name) && !customElements.get(name).prototype.__placeholder) {
        return Promise.resolve();
    }

    // If the component is already loaded, return immediately
    if (loadedComponents.has(name)) {
        return Promise.resolve();
    }

    // If the component is already being loaded, return the existing promise
    if (loadingComponents.has(name)) {
        return loadingComponents.get(name);
    }

    // If the component is in the registry but not registered, mark as loaded
    if (componentRegistry.has(name) && !customElements.get(name)) {
        loadedComponents.set(name, componentRegistry.get(name));
        return Promise.resolve();
    }

    // If the component is in the path registry, load it
    if (componentPathRegistry.has(name)) {
        // Register a placeholder component if not already registered
        if (!customElements.get(name)) {
            // Define a minimal placeholder with the actual tag name
            customElements.define(name, PlaceholderComponent);
        }

        const { path, options } = componentPathRegistry.get(name);

        // Create a promise for the loading process
        const loadingPromise = import(path)
            .then(() => {
                // The module should have registered the component in the registry
                if (!componentRegistry.has(name)) {
                    console.warn(`Component ${name} was not registered by module ${path}`);
                    return;
                }

                // Store the loaded component info but don't register it yet
                const { renderer, options: componentOptions } = componentRegistry.get(name);
                loadedComponents.set(name, {
                    renderer,
                    options: { ...options, ...componentOptions }
                });

                // Remove from loading registry
                loadingComponents.delete(name);
            })
            .catch(error => {
                console.error(`Failed to load component ${name} from ${path}:`, error);
                loadingComponents.delete(name);
                throw error;
            });

        // Store the loading promise
        loadingComponents.set(name, loadingPromise);
        return loadingPromise;
    }

    // If the component is not found in any registry, return a rejected promise
    return Promise.reject(new Error(`Component ${name} is not defined in any registry.`));
}

/**
 * Register a component that has been loaded
 * @param {string} name - The component name
 * @returns {boolean} - Whether the component was registered successfully
 */
export function registerLoadedComponent(name) {
    // If the component is already registered (with a non-placeholder), return true
    if (customElements.get(name) && !customElements.get(name).prototype.__placeholder) {
        return true;
    }

    // If the component is in the registry, register it directly
    if (componentRegistry.has(name)) {
        const { renderer, options } = componentRegistry.get(name);
        registerComponent(name, renderer, options);
        return true;
    }

    // If the component has been loaded, register it
    if (loadedComponents.has(name)) {
        const { renderer, options } = loadedComponents.get(name);
        registerComponent(name, renderer, options);

        // Update any existing instances in the DOM
        updatePlaceholderInstances(name);

        // Remove from loaded registry
        loadedComponents.delete(name);
        return true;
    }

    return false;
}

/**
 * Load and register a component
 * @param {string} name - The component name
 * @returns {Promise} - A promise that resolves when the component is registered
 */
export async function importAndRegisterComponent(name) {
    // Load the component
    await loadComponent(name);

    // Register the component
    const registered = registerLoadedComponent(name);

    if (!registered) {
        return Promise.reject(new Error(`Failed to register component ${name}.`));
    }

    return Promise.resolve();
}

/**
 * Replace placeholder instances with the real component
 * @param {string} name - The component name
 */
function updatePlaceholderInstances(name) {
    // Find all instances with data-loading attribute
    // We need to create a new array because the elements will be modified during the loop
    const placeholders = Array.from(document.querySelectorAll(`${name}[data-loading]`));

    // For each placeholder instance, create a new instance of the real component
    placeholders.forEach(placeholder => {
        // Get all attributes from the placeholder
        const attributes = Array.from(placeholder.attributes);

        // Create a new instance of the real component
        const realComponent = document.createElement(name);

        // Copy all attributes to the new instance except data-loading
        attributes.forEach(attr => {
            if (attr.name !== 'data-loading') {
                realComponent.setAttribute(attr.name, attr.value);
            }
        });

        // Copy any children from the placeholder to the real component
        while (placeholder.firstChild) {
            realComponent.appendChild(placeholder.firstChild);
        }

        // Replace the placeholder with the real component
        if (placeholder.parentNode) {
            placeholder.parentNode.replaceChild(realComponent, placeholder);
        }
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
    { autoRegister = true, rootNode = document.body, lazyLoad = false } = {},
) {
    if (autoRegister && !lazyLoad) registerAllComponents();
    const RootComponent = AppComponent();
    if (isFunction(RootComponent)) RootComponent(rootNode);
}
