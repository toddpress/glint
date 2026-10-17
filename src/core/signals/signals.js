import { State, Computed, subtle, Signal, effect, batch, untracked } from './signal-adapter.js';
import { Scope } from '../scope.js';
import { recordConstructionRead } from '../../diagnostics/config.js';
export { State, Computed, subtle, Signal, effect, batch };
export const isSignal = value => typeof value === 'function' && value.__isSignal === true;
export const isComputed = value => isSignal(value) && value.__isComputed === true;
export function wrap(base, { customSetter = null } = {}) {
  const readonly = base instanceof Computed;
  function accessor(next) {
    if (!arguments.length) { recordConstructionRead(accessor); return base.get(); }
    if (readonly) throw new Error('Cannot set a computed signal');
    return customSetter ? customSetter(next) : base.set(next);
  }
  accessor.get = () => accessor();
  accessor.peek = () => base._s.peek();
  accessor.subscribe = listener => effect(() => listener(accessor()));
  if (!readonly) accessor.set = next => accessor(next);
  accessor.__tc39 = base;
  accessor.__isSignal = true;
  accessor.__isComputed = readonly;
  accessor.__isState = !readonly;
  return accessor;
}
export const signal = initial => wrap(new State(initial));
export function computed(fn) {
  let last;
  const base = new Computed(() => last = fn());
  const value = wrap(base);
  let disposed = false;
  value.dispose = () => {
    if (disposed) return;
    disposed = true;
    base._s = new State(last)._s;
  };
  return value;
}
export const peek = value => isSignal(value) ? value.peek() : value;
export const unwrapOne = value => isSignal(value) ? value() : value;
export const readValue = value => typeof value === 'function' ? value() : value;
export function createSignalAdapter(adapter) {
  for (const name of ['signal', 'computed', 'effect', 'batch', 'peek', 'isSignal', 'isComputed']) {
    if (typeof adapter?.[name] !== 'function') throw new TypeError(`Signal adapter requires ${name}`);
  }
  return adapter;
}
// Compatibility name from the demo: backed by Preact, not a TC39 polyfill.
export const tc39Signals = createSignalAdapter({ signal, computed, effect, batch, peek, isSignal, isComputed });
export function createStateContainer() {
  const scope = new Scope('state');
  function state(definition) {
    const shape = {};
    for (const [name, value] of Object.entries(definition)) {
      shape[name] = typeof value === 'function' ? state.computed(() => value(shape)) : state.signal(value);
    }
    return shape;
  }
  state.signal = signal;
  state.computed = fn => {
    const value = computed(fn);
    scope.own(value.dispose);
    return value;
  };
  state.effect = fn => effect(fn, scope);
  state.own = disposer => scope.own(disposer);
  state.dispose = () => scope.dispose();
  Object.defineProperty(state, 'disposed', { get: () => scope.disposed });
  return state;
}
export { untracked };
