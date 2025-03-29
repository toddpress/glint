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

export function component(name, renderer) {
    if (!/^[a-z][a-z0-9]*-[a-z0-9-]+$/.test(name))
        throw new Error(`Invalid custom element name: '${name}'.`);
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
    if (!renderer)
        throw new Error(`Component ${name} is not defined in the registry.`);

    customElements.define(
        name,
        class extends HTMLElement {
            static styles = new Set();

            props = {};
            hooks = { onMount: [], onDestroy: [] };

            _uuid = generateUuid();
            _renderScheduled = false;

            constructor() {
                super();
                this.effectsCleanupFns = [];
                this._mutationObserver = new MutationObserver(
                    this._onAttributesChanged,
                );
                this.attachShadow({ mode: 'open' });
                this._initPropsFromAttributes();
                this.dataset.id = this._getTaggedUuid();
                this._mutationObserver.observe(this, {
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
                this._mutationObserver.disconnect();
                removeAllEventListeners(this.shadowRoot);
                this.hooks.onDestroy.forEach((fn) => fn());
                this.effectsCleanupFns.forEach((fn) => fn());
                this.effectsCleanupFns = [];
            }

            _getTaggedUuid = (tag) =>
                [name, tag, this._uuid].filter(Boolean).join('_');

            _applyStyles = () => {
                if (!this.constructor.styles.size) return;
                const tag = document.createElement('style');
                tag.type = 'text/css';
                tag.dataset.styleId = this._getTaggedUuid('style');
                tag.textContent = [...this.constructor.styles].join('\n\n');
                this.shadowRoot.appendChild(tag);
            };

            _initPropsFromAttributes() {
                for (const { name, value } of this.attributes) {
                    this._setReactiveProp(name, safeParse(value));
                }
            }

            _onAttributesChanged = (mutations) => {
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
                const _props = Object.entries(this.props).reduce(
                    (acc, [key, sig]) => {
                        acc[key] = sig();
                        return acc;
                    },
                    {},
                );
                const renderFn = renderer(_props);
                if (isFunction(renderFn)) renderFn(this.shadowRoot);
                popCurrentComponent();
            };
        },
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
