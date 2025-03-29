import { getCurrentComponent } from './lifecycle.js';
import {
  debounce,
  isFunction
} from './utils.js';

let activeSubscriber = null;

export function signal(initialValue) {
    let _value = initialValue;
    const subscribers = new Set();

    function accessor(newValue) {
        if (arguments.length === 0) {
            activeSubscriber && subscribers.add(activeSubscriber);
            return _value;
        }
        if (Object.is(_value, newValue)) return;
        _value = newValue;
        subscribers.forEach((fn) => fn());
    }

    accessor.subscribe = (fn) => {
        subscribers.add(fn);
        return () => subscribers.delete(fn);
    };

    return accessor;
}

export function computed(fn) {
    const accessor = signal(fn());
    function update() {
        activeSubscriber = update;
        accessor(fn());
        activeSubscriber = null;
    }
    update();
    return accessor;
}

export function effect(fn) {
    const comp = getCurrentComponent();
    if (!comp) return;
    function run() {
      activeSubscriber = run;
      const cleanup = fn();
      activeSubscriber = null;
      if (isFunction(cleanup)) comp.effectsCleanupFns.push(cleanup);
    }
    run();
}

export function debouncedSignal(
    initialValue,
    delay = 300,
    { leading = false, trailing = true } = {},
) {
    let _value = initialValue;
    const subscribers = new Set();
    const debouncedSet = debounce(
        (val) => {
            if (Object.is(_value, val)) return;
            _value = val;
            subscribers.forEach((fn) => fn(_value));
        },
        delay,
        { leading, trailing },
    );

    function accessor(newValue) {
        if (arguments.length === 0) {
            if (activeSubscriber) subscribers.add(activeSubscriber);
            return _value;
        }
        debouncedSet(newValue);
    }
    accessor.subscribe = (fn) => {
        subscribers.add(fn);
        return () => subscribers.delete(fn);
    };
    return accessor;
}
