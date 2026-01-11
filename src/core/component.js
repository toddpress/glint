import { _emit } from '../internal/logging';
import { createStateContainer, Signal } from './signals';
import { renderTemplate } from './template';
import { safeParse } from './utils';

// ------------------------------------------------------------
// BaseComponent
// ------------------------------------------------------------

export class BaseComponent extends HTMLElement {
  static renderer = null;
  static options = { useShadow: true };

  props = {};
  hooks = { onMount: [], onDestroy: [] };
  effectsCleanupFns = [];

  #root;

  constructor() {
    super();

    const { useShadow } = this.constructor.options;
    this.#root = useShadow
      ? this.attachShadow({ mode: 'open' })
      : this;

    this.props = this._collectProps();
    this.state = createStateContainer();

    this.ctx = {
      el: this,
      root: this.#root,
      props: this.props,
      state: this.state,
      effect: (fn) => {
        const stop = Signal.effect(() => {
          const cleanup = fn();
          if (typeof cleanup === 'function') {
            this.effectsCleanupFns.push(cleanup);
          }
        });
        this.effectsCleanupFns.push(stop);
      },
      emit: this.emit.bind(this),
      onMount: (fn) => this.hooks.onMount.push(fn),
      onDestroy: (fn) => this.hooks.onDestroy.push(fn),
    };
  }

  connectedCallback() {
    this._render();
    queueMicrotask(() => {
      this.hooks.onMount.forEach((fn) => fn());
    });
  }

  disconnectedCallback() {
    this.hooks.onDestroy.forEach((fn) => fn());
    this.effectsCleanupFns.forEach((fn) => fn?.());
    this.effectsCleanupFns = [];
  }

  emit(name, detail) {
    this.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  _collectProps() {
    return Array.from(this.attributes).reduce((acc, attr) => {
      acc[attr.name] = safeParse(attr.value);
      return acc;
    }, {});
  }

  _render() {
    const renderer = this.constructor.renderer;
    if (!renderer) return;

    const tpl = renderer(this.ctx);
    const dom = renderTemplate(tpl, (fn) => this.ctx.effect(fn));

    this.#root.innerHTML = '';
    this.#root.appendChild(dom);
  }
}

export const define = (name, renderer, options = {}) => {
  const mergedOptions = {
    ...BaseComponent.options,
    ...options,
  };

  const existing = customElements.get(name);
  if (existing) {
    _emit('COMPONENT_ALREADY_DEFINED', { name });
    return existing;
  }

  try {
    customElements.define(
      name,
      class extends BaseComponent {
        static renderer = renderer;
        static options = mergedOptions;
      }
    );
  } catch (err) {
    // Covers race conditions or double-define from another bundle
    _emit('COMPONENT_ALREADY_DEFINED', { name, err });
    return customElements.get(name);
  }

  return customElements.get(name);
};
