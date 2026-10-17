import { createStateContainer, signal, untracked } from './signals/index.js';
import { Scope } from './scope.js';
import { mount } from './mount.js';
import { ref } from './parts/RefPart.js';
import { propsFor } from './component-props.js';
import { createInternalsController } from '../internal/element-internals.js';
import { beginConstructionDiagnostics, endConstructionDiagnostics, warn } from '../diagnostics/config.js';
function componentClass(definition, options) {
  // Delaying access to HTMLElement lets reactivity be imported without a DOM.
  return class GlintElement extends HTMLElement {
    static formAssociated = Boolean(options.formAssociated);
    constructor() {
      super();
      this.__target = options.useShadow ? this.attachShadow({ mode: 'open' }) : this;
      this.__runtime = null;
    }
    connectedCallback() {
      if (this.__runtime && !this.__runtime.scope.disposed) return;
      const scope = new Scope('component');
      const state = createStateContainer();
      scope.own(() => state.dispose());
      const version = signal(0);
      const hooks = { connected: [], disconnected: [] };
      const internals = createInternalsController(this, this.constructor);
      const ctx = {
        el: this, element: this, root: this.__target, state,
        get props() { version(); return propsFor(ctx.element); },
        effect: fn => state.effect(fn),
        own: disposer => scope.own(disposer),
        connected: fn => hooks.connected.push(fn),
        disconnected: fn => hooks.disconnected.push(fn),
        onMount: fn => hooks.connected.push(fn),
        onDestroy: fn => hooks.disconnected.push(fn),
        ref, internals: internals.get,
        emit: (name, detail, eventOptions = {}) => {
          const Event = this.ownerDocument.defaultView.CustomEvent;
          const event = new Event(name, { detail, bubbles: true, composed: true, ...eventOptions });
          this.dispatchEvent(event);
          return event;
        },
      };
      this.__runtime = { scope, state, hooks, ctx };
      this.ctx = ctx;
      this.state = state;
      const Observer = this.ownerDocument.defaultView.MutationObserver;
      const observer = new Observer(() => version(version.peek() + 1));
      scope.own(() => observer.disconnect());
      const frame = beginConstructionDiagnostics(this.localName);
      let value;
      try {
        value = untracked(() => {
          if (typeof definition === 'function') return definition(ctx);
          const local = typeof definition.setup === 'function' ? definition.setup(ctx) : {};
          return definition.view(ctx, local);
        });
      } catch (error) {
        scope.dispose();
        throw error;
      } finally { endConstructionDiagnostics(frame); }
      try {
        const view = mount(this.__target, value);
        scope.own(() => view.dispose());
        observer.observe(this, { attributes: true });
        for (const hook of hooks.connected) hook();
      } catch (error) { scope.dispose(); throw error; }
    }
    disconnectedCallback() {
      const runtime = this.__runtime;
      // Native range moves invoke disconnect/connect. Preserve runtime identity
      // for moves within a document, but dispose real removals after this turn.
      queueMicrotask(() => {
        if (this.isConnected || runtime !== this.__runtime || runtime?.scope.disposed) return;
        try {
          for (const hook of runtime.hooks.disconnected) hook();
        } finally { runtime.scope.dispose(); }
      });
    }
    emit(name, detail, options) { return this.ctx.emit(name, detail, options); }
  };
}
export function define(name, definition, options = {}) {
  if (typeof definition !== 'function' && typeof definition?.view !== 'function') throw new TypeError('define expects a function or { setup, view }');
  const existing = customElements.get(name);
  if (existing) { warn('component already defined', name); return existing; }
  const Component = componentClass(definition, { useShadow: false, ...options });
  // Invalid names and platform registration errors must remain actionable.
  customElements.define(name, Component);
  return Component;
}
define.shadow = (name, definition, options = {}) => define(name, definition, { ...options, useShadow: true });
define.light = (name, definition, options = {}) => define(name, definition, { ...options, useShadow: false });
