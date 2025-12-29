/**
 * Glint Patterns
 * --------------
 *
 * This directory contains *optional, first-party patterns* for authoring
 * Glint applications.
 *
 * Patterns are NOT core primitives. Glint does not require them, and removing
 * them does not change the underlying rendering or reactivity model.
 *
 * They exist to:
 *   • encode patterns of thought
 *   • reduce boilerplate
 *   • standardize common idioms
 *   • teach “the Glint way” without forcing it
 *
 * Think of these as blessed, idiomatic conveniences — not framework rules.
 * You can ignore them entirely, reimplement them yourself, or invent your own.
 *
 * Core Glint remains small, explicit, and unopinionated.
 */

export { model } from './model.js';
export { each, when, match } from './template.js';
