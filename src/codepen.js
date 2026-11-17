import * as Glint from './index.js';
// Global registration is confined to the explicitly requested demo build.
if (typeof window !== 'undefined') window.Glint = Glint;
export * from './index.js';
