
export const isFunction = (val) => typeof val === 'function';
export const isString = (val) => typeof val === 'string';
export const isNumber = (val) => typeof val === 'number';
export const isBoolean = (val) => typeof val === 'boolean';

export const isPrimitive = (v) =>
  v == null || isString(v) || isNumber(v) || isBoolean(v);


// --- scheduling.js ---

export function debounce(fn, delay = 300, options = {}) {
  const { leading = false, trailing = true } = options;

  let timerId = null;
  let lastArgs = null;
  let lastThis = null;
  let leadingCalled = false;

  const invoke = () => {
    timerId = null;
    if (trailing && lastArgs) {
      fn.apply(lastThis, lastArgs);
      lastArgs = lastThis = null;
    }
    leadingCalled = false;
  };

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;

    if (!timerId && leading && !leadingCalled) {
      fn.apply(lastThis, lastArgs);
      leadingCalled = true;
      lastArgs = lastThis = null;
    }

    clearTimeout(timerId);
    timerId = setTimeout(invoke, delay);
  }

  debounced.cancel = () => {
    clearTimeout(timerId);
    timerId = null;
    lastArgs = lastThis = null;
    leadingCalled = false;
  };

  return debounced;
}

export const safeParse = (v) => {
  if (typeof v !== 'string') return v;
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
};

export const generateUuid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

export const isSignal = (s) => s?.__isSignal === true;
export const isComputed = (s) => s?.__isComputed === true;
export const isState = (s) => s?.__isState === true;
export const isTemplate = (t) => t?.__template === true;
