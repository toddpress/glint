// ============================================================
// Glint Signals Layer
// ------------------------------------------------------------
// Built on top of signal-core.js, but does NOT import Preact
// directly. This module defines the ergonomic signal API used
// by components, the template engine, and helpers.
// ============================================================

import { State, Computed, subtle, Signal } from './signal-adapter';

// Re-export core primitives so app authors (optionally) can
// reach for them via the public index if we choose to expose them.
export { State, Computed, subtle, Signal };

// ------------------------------------------------------------
// Type / value helpers
// ------------------------------------------------------------

import { isComputed, isFunction } from '../utils';

// ------------------------------------------------------------
// Accessor wrapper — Glint-style signals
// ------------------------------------------------------------

export function wrap(base, { customSetter = null } = {}) {
  const isComputedBase = isComputed(base);

  function accessor(next) {
    // getter
    if (arguments.length === 0) return base.get();

    // computed cannot be set
    if (isComputedBase) {
      throw new Error('Cannot set a computed signal');
    }

    // custom setter (e.g., structured updates)
    if (customSetter) {
      return customSetter(next);
    }

    // default setter
    return base.set(next);
  }

  accessor.get = () => base.get();
  accessor.peek = () => subtle.get(base);
  accessor.subscribe = (fn) => base.subscribe(fn);

  if (!isComputedBase) {
    accessor.set = (v) =>
      customSetter ? customSetter(v) : base.set(v);
  }

  accessor.__tc39 = base;
  accessor.__isSignal = true;
  accessor.__isComputed = isComputedBase;
  accessor.__isState = !isComputedBase;

  return accessor;
}

// unwrapOne — one layer of reactive unwrapping
export function unwrapOne(v) {
  if (isSignal(v) || isComputed(v)) return v();
  return v;
}

// ------------------------------------------------------------
// createStateContainer — ctx.state() factory
// ------------------------------------------------------------

export const createStateContainer = () => {
  const signalFn = (v) => wrap(new State(v));
  const computedFn = (fn) => wrap(new Computed(fn));

  const defineShape = (def) => {
    const entries = Object.entries(def);

    // Phase 1 — signals + placeholders
    const { api, temp } = entries.reduce(
      (acc, [key, val]) => {
        if (isFunction(val)) {
          acc.temp[key] = null;
        } else {
          const sig = signalFn(val);
          acc.temp[key] = sig;
          acc.api[key] = sig;
        }
        return acc;
      },
      { api: {}, temp: {} }
    );

    // Phase 2 — computed values
    entries
      .filter(([, val]) => isFunction(val))
      .forEach(([key, val]) => {
        const comp = computedFn(() => val(temp));
        temp[key] = comp;
        api[key] = comp;
      });

    return api;
  };

  const state = (def) => defineShape(def);

  state.signal = signalFn;
  state.computed = computedFn;

  return state;
};
