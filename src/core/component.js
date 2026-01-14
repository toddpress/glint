import { __DEV__ } from '../internal/env';
import { _emit } from '../internal/logging';
import { createInternalsController } from '../internal/element-internals';

import { createStateContainer, Signal } from './signals';
import { renderTemplate } from './template';
import { safeParse } from './utils';
import { createEffectScope } from '../internal/effect-scope';

// ------------------------------------------------------------
// BaseComponent
// ------------------------------------------------------------
export class BaseComponent extends HTMLElement {
  static initializer = null;
  static options = {};

  #root;
  #effectScope = createEffectScope();

  props = {};
  hooks = { onMount: [], onDestroy: [] };


  constructor() {
    super();

    const Component = this.constructor;

    const { useShadow } = Component.options;
    this.#root = useShadow
      ? this.attachShadow({ mode: 'open' })
      : this;

    this.props = this._collectProps();
    this.state = createStateContainer();

    const internals = createInternalsController(this, Component);

    this.ctx = {
      el: this,
      root: this.#root,

      props: this.props,
      state: this.state,
      effect: this.#effectScope.effect,
      effectScope: this.#effectScope,
      internals: internals.get,
      emit: this.emit.bind(this),
      onMount: (fn) => this.hooks.onMount.push(fn),
      onDestroy: (fn) => this.hooks.onDestroy.push(fn),
    };

    if (__DEV__) {
      queueMicrotask(internals.audit);
    }
  }

  connectedCallback() {
    this._render();
    queueMicrotask(() => {
      this.hooks.onMount.forEach((fn) => fn());
    });
  }

  disconnectedCallback() {
    this.hooks.onDestroy.forEach((fn) => fn());
    this.#effectScope.dispose();
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
    const initializer = this.constructor.initializer;
    if (!initializer) return;

    const tpl = initializer(this.ctx);
    const dom = renderTemplate(tpl, (fn) => this.ctx.effect(fn));

    this.#root.innerHTML = '';
    this.#root.appendChild(dom);
  }
}

export const define = (name, initializer, options = {}) => {
  const {
    formAssociated = false,
    useShadow = true,
    ...componentOptions
  } = options;

  const mergedOptions = {
    ...BaseComponent.options,
    ...componentOptions,
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
        static initializer = initializer;
        static options = mergedOptions;
        static formAssociated = formAssociated;
      }
    );
  } catch (err) {
    // Covers race conditions or double-define from another bundle
    _emit('COMPONENT_ALREADY_DEFINED', { name, err });
    return customElements.get(name);
  }

  return customElements.get(name);
};
