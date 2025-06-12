// === utils.js ===

/** Type check for signal-like objects (functions with .subscribe) */
export const isSignalLike = (val) =>
  typeof val === 'function' && typeof val.subscribe === 'function';

/** Type check for any function */
export const isFunction = (val) =>
  typeof val === 'function';

/** Attempts to parse a string that looks JSON-ish */
export const safeParse = (val) => {
  if (typeof val !== 'string') return val;

  const isJsonLike = /^\s*(?:\{|\[|'(?:\\.|[^'])*'|true|false|null|-?\d+(\.\d+)?)[\s\S]*$/.test(val);
  try {
    return isJsonLike ? JSON.parse(val) : val;
  } catch {
    return val;
  }
};

/** Generates a (reasonably) unique identifier string */
export const generateUuid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

/**
 * Simple debounce implementation.
 * Returns a function that delays invoking `fn` until after `delay` ms
 * have elapsed since the last call. Supports leading and trailing
 * invocation options similar to lodash.
 */
export const debounce = (
  fn,
  delay = 0,
  { leading = false, trailing = true } = {}
) => {
  let timer = null;
  let lastArgs;
  let leadingCalled = false;

  const invoke = () => {
    timer = null;
    if (trailing && lastArgs) {
      fn(...lastArgs);
      lastArgs = undefined;
    }
    leadingCalled = false;
  };

  return (...args) => {
    lastArgs = args;

    if (leading && !leadingCalled) {
      leadingCalled = true;
      fn(...args);
    }

    if (timer) clearTimeout(timer);
    timer = setTimeout(invoke, delay);
  };
};

/** Maps a PascalCase or CamelCase export name to a kebab-case tag name */
export const exportNameToTagName = (exportName) => {
  const words = exportName.match(/[A-Z][a-z]*/g);
  if (!words) return null;
  return (words.length === 1 ? `gl-${exportName}` : words.join('-')).toLowerCase();
};

/** Determines whether an element is a Glint-registered custom element */
export const isGlintComponent = (node) =>
  node instanceof HTMLElement &&
  !!customElements.get(node.tagName.toLowerCase());
