import { Signal } from './adapter.js';
import { wrap } from './core.js';

import { getCurrentComponent } from '../lifecycle.js';
import { isFunction } from '../utils.js';

/**
 * Glint Signals — Public Reactivity API
 * --------------------------------------
 * This file defines the *official* Glint developer-facing signal primitives.
 *
 * Exports:
 *   - signal(initial)
 *   - computed(fn)
 *   - effect(fn)
 *   - batch(fn)
 *
 * These functions provide the stable, ergonomic interface Glint developers use.
 *
 * Implementation details:
 *   - Relies on the backend adapter (`adapter.js`) for actual reactive behavior.
 *   - Uses `core.js` (wrapSignal) to construct ergonomic accessor-style signals.
 *   - MUST NOT import Preact or any backend-specific dependency directly.
 *
 * Design goals:
 *   - Zero dependency leakage from backend to user.
 *   - TC39-native signals can replace the backend with *no API changes*.
 *   - Minimal surface area; no internal helpers are exposed here.
 *
 * This is the top-level “front door” of Glint’s reactivity system.
 */

export function signal(initial) {
  return wrap(new Signal.State(initial));
}

export function computed(fn) {
  return wrap(new Signal.Computed(fn));
}

export function effect(fn) {
  const comp = getCurrentComponent();
  // If NOT IN a component render, use a free-floating effect
  if (!comp) return Signal.effect(fn);

  const stop = Signal.effect(() => {
    const cleanup = fn();
    if (isFunction(cleanup)) {
      comp.effectsCleanupFns.push(cleanup);
    }
  });

  comp.effectsCleanupFns.push(stop);
}
