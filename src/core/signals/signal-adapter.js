// This is the only runtime module that depends on Preact Signals.
import { signal as preactSignal, computed as preactComputed, effect as preactEffect, batch, untracked } from '@preact/signals-core';
import { tracked } from '../../diagnostics/config.js';
export class State {
  constructor(initial) { this._s = preactSignal(initial); }
  get value() { return this.get(); }
  set value(next) { this.set(next); }
  get() { return this._s.value; }
  set(next) {
    if (!Object.is(this._s.peek(), next)) {
      // Preact uses ===; make -0/0 observable while retaining Object.is semantics.
      if (next === 0 && this._s.peek() === 0) batch(() => { this._s.value = undefined; this._s.value = next; });
      else this._s.value = next;
    }
    return next;
  }
  subscribe(listener) { return effect(() => listener(this.get())); }
}
export class Computed extends State {
  constructor(fn) { super(undefined); this._s = preactComputed(() => tracked(fn)); }
  set() { throw new Error('Cannot set a computed signal'); }
}
export function effect(fn, owner) {
  let stop;
  let disposed = false;
  let release = () => {};
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    release();
    stop?.();
  };
  dispose.dispose = dispose;
  Object.defineProperty(dispose, 'disposed', { get: () => disposed });
  if (owner?.disposed) { disposed = true; return dispose; }
  stop = preactEffect(() => tracked(fn));
  release = owner?.own(dispose) ?? release;
  return dispose;
}
export const subtle = {
  get(target) { return target._s.peek(); },
  set(target, value) { return target.set(value); },
};
export { batch, untracked };
export const Signal = { State, Computed, subtle, effect, batch };
