// === reactivity.js ===
import { getCurrentComponent } from './lifecycle.js';
import { debounce, isFunction } from './utils.js';

let activeSubscriber = null;

export const withTracking = (fn, subscriber) => {
  activeSubscriber = subscriber;
  const result = fn();
  activeSubscriber = null;
  return result;
};

const createSignalCore = (initial, onSet = (val, setter) => setter(val)) => {
  let value = initial;
  const subscribers = new Set();

  const notify = () => subscribers.forEach(fn => fn(value));

  const set = (next) => {
    if (Object.is(next, value)) return;
    onSet(next, (v) => {
      value = v;
      notify();
    });
  };

  const get = () => {
    if (activeSubscriber) subscribers.add(activeSubscriber);
    return value;
  };

  const subscribe = (fn) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  };

  const accessor = (...args) =>
    args.length === 0 ? get() : set(args[0]);

  accessor.subscribe = subscribe;
  return accessor;
};

export const signal = (initial) => createSignalCore(initial);

export const debouncedSignal = (initial, delay = 300, options = { leading: false, trailing: true }) =>
  createSignalCore(initial, debounce((v, setter) => setter(v), delay, options));

export const computed = (fn) => {
  const s = signal(fn());
  const update = () => withTracking(() => s(fn()), update);
  update();
  return s;
};

export const effect = (fn) => {
  const comp = getCurrentComponent();
  if (!comp) return;

  const run = () => {
    const cleanup = withTracking(fn, run);
    if (isFunction(cleanup)) comp.effectsCleanupFns.push(cleanup);
  };

  run();
};
