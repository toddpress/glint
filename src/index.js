// ============================================================
// Glint — Public API Surface
// ============================================================
// This file intentionally re-exports ONLY the pieces required
// to author Glint applications. Internal plumbing remains
// private to preserve DX, stability, and refactor freedom.
// ============================================================


// Core authoring primitives

export { html } from './template';
export { define } from './component';
export { render, createRoot } from './root';

// Template helpers

export { each, when, match } from './helpers';


// Advanced signals usage

// These are intentionally limited. Most users should rely on
// ctx.state() inside components instead of importing signals
// directly — but power users can opt in.

// export { Signal } from './signal-core.js';
// export { createStateAPI, wrap } from './signals.js';
