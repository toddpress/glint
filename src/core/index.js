/**
 * Glint Core
 * ----------
 *
 * This directory contains the *foundational execution substrate* of Glint.
 *
 * Everything here is required for Glint to function:
 *   • component definition and lifecycle
 *   • the template engine and DOM parts
 *   • the reactivity system (signals)
 *   • internal wiring and invariants
 *
 * These are not patterns, conveniences, or stylistic choices.
 * They define what Glint *is* at runtime.
 *
 * User code should generally not import from core directly.
 * The public API is re-exported selectively from `src/index.js`.
 *
 * If something can be removed without breaking Glint itself,
 * it does not belong here.
 */

export { html } from './template';
export { define } from './component';
export { mount as render } from './root';
