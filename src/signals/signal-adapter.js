import {
  signal as _preactSignal,
  computed as _preactComputed,
  effect as _preactEffect,
  batch as _preactBatch,
} from '@preact/signals-core';

import { isComputed } from '../utils';


// ============================================================
// Glint Signal Core — the ONLY file touching Preact Signals.
// ============================================================
// This isolates the external dependency and allows us to later
// swap in TC39 Signals, Solid Signals, or a homegrown variant
// without modifying the rest of Glint’s architecture.

// ------------------------------------------------------------
// State — thin wrapper around Preact's basic signal()
// ------------------------------------------------------------

export class State {
  constructor(initial) {
    this._s = _preactSignal(initial);
  }

  // alias for ergonomic access
  get value() { return this._s.value; }
  set value(v) { this._s.value = v; }

  get() {
    return this._s.value;
  }

  set(v) {
    this._s.value = v;
    return v;
  }

  subscribe(listener) {
    return _preactEffect(() => listener(this._s.value));
  }
}

// ------------------------------------------------------------
// Computed — thin wrapper around Preact's computed()
// ------------------------------------------------------------
export class Computed {
  constructor(fn) {
    this._s = _preactComputed(fn);
  }

  get value() { return this._s.value; }
  get() { return this._s.value; }

  set(_) {
    throw new Error('Cannot directly set a Computed signal.');
  }
}

// ------------------------------------------------------------
// Subtle — low-level non-reactive access (like Solid.peek)
// ------------------------------------------------------------
export const subtle = {
  get(target) {
    if (target instanceof State || isComputed(target)) {
      return target._s.peek();
    }
    throw new TypeError('subtle.get: unsupported target');
  },
  set(target, value) {
    if (target instanceof State) return target.set(value);
    throw new TypeError('subtle.set: not writable');
  },
};

// ------------------------------------------------------------
// Unified Signal API — exported as a single namespace
// ------------------------------------------------------------
export const Signal = {
  State,
  Computed,
  subtle,
  effect: _preactEffect,
  batch: _preactBatch,
};
