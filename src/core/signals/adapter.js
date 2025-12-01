/**
 * Glint Signals — Backend Adapter
 * --------------------------------
 * This file provides the *reactive backend* used by Glint’s signal system.
 *
 * - It adapts the underlying reactive engine (currently Preact Signals Core)
 *   into a TC39-style shape: `State`, `Computed`, `effect`, `batch`, and `subtle`.
 *
 * - Glint’s public reactivity API (in `glint.js`) depends ONLY on this file.
 *   No other file should import Preact directly.
 *
 * - When native TC39 Signals land, this is the *only file that changes*.
 *   The rest of Glint’s reactivity layer remains untouched.
 *
 * Responsibilities:
 *   - Wrap the backend’s primitives into Glint’s expected State/Computed classes.
 *   - Provide unified effect() and batch() implementations.
 *   - Provide a low-level “subtle” namespace for non-tracking reads and writes.
 *
 * This file is intentionally minimal: it is the “engine room” layer.
 */

import {
  signal as _preactSignal,
  computed as _preactComputed,
  effect as _preactEffect,
  batch as _preactBatch,
} from '@preact/signals-core';

export class State {
  constructor(initial) {
    this._s = _preactSignal(initial);
  }

  get() {
    return this._s.value;
  }

  set(value) {
    this._s.value = value;
    return value;
  }

  get value() {
    return this._s.value;
  }

  set value(v) {
    this._s.value = v;
  }

  subscribe(listener) {
    return _preactEffect(() => listener(this._s.value));
  }
}

export class Computed {
  constructor(fn) {
    this._s = _preactComputed(fn);
  }

  get() {
    return this._s.value;
  }

  get value() {
    return this._s.value;
  }

  set(_) {
    throw new Error('Cannot directly set a Computed signal.');
  }
}

/* ----------------------------------------------
   Subtle namespace (non-tracking reads, low-level ops)
   ---------------------------------------------- */

export const subtle = {
  get(target) {
    // our State / Computed wrappers
    if (target instanceof State || target instanceof Computed) {
      return target._s.peek(); // non-tracking read
    }
    throw new TypeError('Signal.subtle.get: unsupported target');
  },

  set(target, value) {
    if (target instanceof State) {
      target.set(value);
      return value;
    }
    throw new TypeError('Signal.subtle.set: not writable');
  }
};

/* --- TC39-namespaced facade export --- */
export const Signal = {
  State,
  Computed,
  effect: _preactEffect,
  batch: _preactBatch,
  subtle,
};
