/**
 * Glint Signals — Package Entry Point
 * ------------------------------------
 * This file re-exports the subset of the signal system intended for external use.
 *
 * It exposes:
 *   - The Glint public API (`glint.js`)
 *   - Extended signal utilities (`extended.js`)
 *
 * It deliberately hides:
 *   - Backend adapter (`adapter.js`)
 *   - Internal mechanics (`core.js`)
 *
 * This keeps the public surface small and stable.
 */

export * from './glint.js';
export * from './extended.js';
export {
  isSignal,
  isComputed,
  isState,
} from './core.js';
