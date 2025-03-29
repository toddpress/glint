import { componentRegistry } from "./index.js";

export const isSignalLike = (obj) =>
  typeof obj === 'function' && typeof obj.subscribe === 'function';

export function safeParse(str) {
  if (typeof str !== 'string') return str;
  const JSON_LIKE = /^\s*(?:\{|\[|'(?:\\.|[^'])*'|true|false|null|-?\d+(?:\.\d+)?)\s*$/;
  try {
    return JSON_LIKE.test(str) ? JSON.parse(str) : str;
  } catch {
    return str;
  }
}

export function debounce(fn, delay, { leading = false, trailing = true } = {}) {
  let timeout, lastArgs, lastThis, result;
  return function (...args) {
      lastArgs = args;
      lastThis = this;
      const shouldCallNow = leading && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
          timeout = null;
          if (trailing && lastArgs) {
              result = fn.apply(lastThis, lastArgs);
              lastArgs = lastThis = null;
          }
      }, delay);
      if (shouldCallNow) {
          result = fn.apply(lastThis, lastArgs);
          lastArgs = lastThis = null;
      }
      return result;
  };
}

export const generateUuid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

export const isFunction = (value) => typeof value === 'function'

export function isGlintComponent(node) {
  if (!(node instanceof HTMLElement)) return false;
  const tagName = node.tagName.toLowerCase();
  return customElements.get(tagName) && componentRegistry.has(tagName);
}
