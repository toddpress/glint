// ============================================================
// Glint — Public API Surface
// ============================================================
// This file intentionally re-exports ONLY the pieces required
// to author Glint applications. Internal plumbing remains
// private to preserve DX, stability, and refactor freedom.
// ============================================================


// Core authoring primitives
export { html, define, render } from './core';


// Template helpers
export { each, when, match } from './patterns';

// State
export { model } from './patterns/model';
export { createStateContainer } from './core/signals';

// Advanced signals usage

// These are intentionally limited. Most users should rely on
// ctx.state() inside components instead of importing signals
// directly — but power users can opt in.

// export { Signal } from './core/signals';
