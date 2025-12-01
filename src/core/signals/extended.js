import { Signal } from './adapter.js';
import { wrap } from './core.js';
import { debounce } from '../utils/debounce.js';

/**
 * Glint Signals — Extended Signal Types
 * --------------------------------------
 * Optional higher-level signal abstractions built on top of Glint’s base primitives.
 *
 * These utilities may depend on:
 *   - Core DX helpers (`wrap` from core.js)
 *   - Backend primitives (`State`, `Computed`, etc. from adapter.js)
 *
 * They MUST NOT:
 *   - Export backend primitives
 *   - Modify or redefine primitive semantics
 *   - Be imported directly by Glint developers
 *
 * These functions exist as internal “reactive recipes” built on top of Glint’s
 * primitive signals. All of them ultimately create a `State` (from the backend)
 * and return a wrapped accessor (via core.js).
 *
 * This file is safe to change, add to, or reorganize without altering the core
 * reactivity model. Extended signals are optional and compositional.
 */

/* Debounced signal */
export function debouncedSignal(
  initialValue,
  delay = 300,
  options = { leading: false, trailing: true }
) {
  const base = new Signal.State(initialValue);
  const debouncedSetter = debounce(
    (v) => base.set(v),
    delay,
    options
  );

  return wrap(base, { customSetter: debouncedSetter });
}

/* Derived signal (explicit deps, like a computed) */
export function derived(deps, fn) {
  const base = new Signal.State(
    fn(deps.map((d) => d()))
  );

  deps.forEach((d) =>
    d.subscribe(() => {
      base.set(fn(deps.map((x) => x())));
    })
  );

  return wrap(base);
}

/* Tweened signal (animate toward target) */
export function tweenedSignal(
  initial,
  { duration = 300, easing = (t) => t } = {}
) {
  const base = new Signal.State(initial);
  let animationFrame = null;

  const customSetter = (target) => {
    const start = base.get();
    const startTime = performance.now();

    if (animationFrame != null) {
      cancelAnimationFrame(animationFrame);
    }

    const tick = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = easing(t);
      base.set(start + (target - start) * eased);
      if (t < 1) {
        animationFrame = requestAnimationFrame(tick);
      } else {
        animationFrame = null;
      }
    };

    animationFrame = requestAnimationFrame(tick);
  };

  return wrap(base, { customSetter });
}

/* Async signal (set when promise resolves) */
export function asyncSignal(promiseOrFn, initial = null) {
  const base = new Signal.State(initial);

  const p =
    typeof promiseOrFn === 'function'
      ? promiseOrFn()
      : promiseOrFn;

  Promise.resolve(p)
    .then((val) => base.set(val))
    .catch((err) => base.set({ error: err }));

  return wrap(base);
}

/* Map signal (read-only transformed view over another signal) */
export function mapSignal(source, fn) {
  const base = new Signal.State(fn(source()));

  source.subscribe((v) => base.set(fn(v)));

  return wrap(base); // effectively readonly in practice
}

/* Persistent/localStorage-backed signal */
// TODO: use safe parse from utils?
export function persistentSignal(key, defaultValue) {
  let stored;
  try {
    stored = localStorage.getItem(key);
  } catch {
    stored = null;
  }

  const initial =
    stored != null
      ? (() => {
          try {
            return JSON.parse(stored);
          } catch {
            return stored;
          }
        })()
      : defaultValue;

  const base = new Signal.State(initial);

  const customSetter = (v) => {
    base.set(v);
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {
      // ignore storage failures
    }
  };

  return wrap(base, { customSetter });
}
