import { Signal } from "./adapter";

/**
 * Glint Signals — Core Internals
 * -------------------------------
 * Internal helpers that implement Glint’s signal mechanics and developer
 * ergonomics. This module sits between:
 *
 *   - The backend adapter (adapter.js)
 *   - The Glint public API surface (glint.js → signals/index.js)
 *
 * Responsibilities:
 *   - `wrap(base, options)`: produces Glint’s unified accessor-style signal:
 *       s()          → getter
 *       s(v)         → setter
 *       s.get()      → explicit getter
 *       s.set(v)     → explicit setter
 *       s.peek()     → non-tracking read
 *       s.subscribe(fn)
 *
 *   - Identity helpers for introspection:
 *       isSignal(), isComputed(), isState()
 *
 * Notes:
 *   - This file MUST NOT import from glint.js (to avoid circular dependencies).
 *   - This file MAY import from the backend adapter (Signal.State, etc.).
 *   - This file defines internal mechanics, but the public API may choose to
 *     re-export a subset of these helpers via signals/index.js.
 *
 * This is the “glue layer” — not the backend, not the public API, but the
 * internal implementation of Glint’s signal semantics.
 */

export function wrap(base, { customSetter = null } = {}) {
  const isComputed = base instanceof Signal.Computed;

  function accessor(next) {
    if (arguments.length === 0) return base.get();

    if (isComputed)
      throw new Error("Cannot set a computed signal");

    if (customSetter)
      return customSetter(next);

    return base.set(next);
  }

  accessor.get = () => base.get();
  accessor.peek = () => Signal.subtle.get(base);
  accessor.subscribe = (fn) => base.subscribe(fn);

  if (!isComputed) {
    accessor.set = (v) =>
      customSetter ? customSetter(v) : base.set(v);
  }

  // Introspection markers
  accessor.__tc39 = base;
  accessor.__isSignal = true;
  accessor.__isComputed = isComputed;
  accessor.__isState = !isComputed;

  return accessor;
}

// Introspection helpers
export const isSignal = (s) => s?.__isSignal === true;
export const isComputed = (s) => s?.__isComputed === true;
export const isState = (s) => s?.__isState === true;
