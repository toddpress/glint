import { componentRegistry } from "./component.js";

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

/**
 * Converts a PascalCase export name to a kebab-case tag name
 * - Single word components get a "gl-" prefix (e.g., "Button" → "gl-button")
 * - Multi-word components are converted to kebab-case (e.g., "UserProfile" → "user-profile")
 *
 * @param {string} exportName - The export name in PascalCase
 * @returns {string} The kebab-case tag name
 */
export function toTagName(exportName) {
  // Handle null, undefined, or empty strings
  if (!exportName) return null;

  // Extract words by looking for capital letters
  const words = exportName.match(/[A-Z][a-z]*/g);
  if (!words || words.length === 0) return null;

  // For single-word components, add "gl-" prefix
  // For multi-word components, convert to kebab-case
  return words.length === 1
    ? `gl-${words[0].toLowerCase()}`
    : words.map(w => w.toLowerCase()).join('-');
}
