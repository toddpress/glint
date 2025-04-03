import { getCurrentComponent } from './lifecycle.js';
import {
  debounce,
  isFunction
} from './utils.js';

let activeSubscriber = null;

export function createSignalAccessor(initialValue, onSet) {
  let value = initialValue;
  const subscribers = new Set();

  function _setValue(newValue) {
    if (Object.is(value, newValue)) return;
    value = newValue;
    subscribers.forEach((fn) => fn(value));
  }

  const defaultOnSet = (newValue, setValue) => {
    setValue(newValue);
  };

  function set(newValue) {
    const _onSet = onSet || defaultOnSet;
    _onSet(newValue, _setValue);
  }

  function get() {
    if (activeSubscriber) {
      subscribers.add(activeSubscriber);
    }
    return value;
  }

  function subscribe(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }

  function accessor(newValue) {
    return arguments.length === 0 ? get() : set(newValue);
  }

  accessor.subscribe = subscribe;

  return accessor;
}

export function withTracking(fn, subscriber) {
  activeSubscriber = subscriber;
  const result = fn();
  activeSubscriber = null;
  return result;
}

export function signal(initialValue) {
  return createSignalAccessor(initialValue);
}

export function computed(fn) {
  const accessor = signal(fn());
  function update() {
    withTracking(() => accessor(fn()), update);
  }
  update();
  return accessor;
}

export function effect(fn) {
  const comp = getCurrentComponent();
  if (!comp) return;
  function run() {
    const cleanup = withTracking(fn, run);
    if (!isFunction(cleanup)) return;
    comp.effectsCleanupFns.push(cleanup);
  }
  run();
}

export function debouncedSignal(
  initialValue,
  delay = 300,
  options = { leading: false, trailing: true }
) {
  const debouncedSetter = debounce((val, setter) => setter(val), delay, options);
  return createSignalAccessor(initialValue, debouncedSetter);
}
