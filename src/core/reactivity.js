import { getCurrentComponent, debounce } from './index.js';

let activeSubscriber = null;

export class Signal {
  constructor(initialValue) {
    this._value = initialValue;
    this.subscribers = new Set();
  }

  get value() {
    // Collect subscription
    if (activeSubscriber) {
      this.subscribers.add(activeSubscriber);
    }
    return this._value;
  }

  set value(newVal) {
    if (Object.is(this._value, newVal)) return;
    this._value = newVal;
    this._notify();
  }

  subscribe(fn) {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  update(fn) {
    this.value = fn(this._value);
  }

  _notify() {
    for (const sub of this.subscribers) {
      sub(this._value);
    }
  }
}

/** Basic signal creation. */
export function signal(initialValue) {
  return new Signal(initialValue);
}

/** A computed signal that automatically re-runs the given fn when dependencies update. */
export function computed(fn) {
  const result = signal(fn());

  function update() {
    activeSubscriber = update;
    const newVal = fn();
    if (!Object.is(newVal, result.value)) {
      result.value = newVal;
    }
    activeSubscriber = null;
  }

  update();
  return result;
}

/** An effect that runs whenever its dependencies change, with optional cleanup. */
export function effect(fn) {
  const comp = getCurrentComponent();
  if (!comp) return;

  function run() {
    activeSubscriber = run;
    const cleanup = fn();
    activeSubscriber = null;
    if (typeof cleanup === 'function') {
      comp.effectsCleanupFns.push(cleanup);
    }
  }
  run();
}

/**
 * A debounced signal: any writes to .value are delayed by `delay` ms,
 * with optional `leading` and `trailing` triggers.
 */
export function debouncedSignal(
  initialValue,
  delay = 300,
  { leading = false, trailing = true } = {}
) {
  let _value = initialValue;
  const subs = new Set();

  function notify() {
    subs.forEach((cb) => cb(_value));
  }

  const debouncedSet = debounce(
    (val) => {
      if (Object.is(_value, val)) return;
      _value = val;
      notify();
    },
    delay,
    { leading, trailing }
  );

  return {
    get value() {
      if (activeSubscriber) {
        subs.add(activeSubscriber);
      }
      return _value;
    },
    set value(val) {
      debouncedSet(val);
    },
    subscribe(cb) {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    update(fn) {
      this.value = fn(this.value);
    }
  };
}