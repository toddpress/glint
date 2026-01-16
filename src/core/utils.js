
export const isFunction = (val) => typeof val === 'function';
export const isString = (val) => typeof val === 'string';
export const isNumber = (val) => typeof val === 'number';
export const isBoolean = (val) => typeof val === 'boolean';

export const isFalse = (val) => val === false;
export const isNullish = (val) => val === null || val === undefined;

export const isAbsentOrFalse = (val) =>
  isNullish(val) || isFalse(val);

export const isPrimitive = (val) =>
   isNullish(val) || isString(val) || isNumber(val) || isBoolean(val);


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

export const safeParse = (val) => {
  if (!isString(val)) return val;

  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
};

export const iif = (condition, consequent, alternative) =>
  condition ? consequent : alternative;

export const generateUuid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

export const isState = (s) => s?.__isState === true;
export const isSignal = (s) => s?.__isSignal === true;
export const isComputed = (s) => s?.__isComputed === true;

export const isTemplate = (t) => t?.__template === true;
