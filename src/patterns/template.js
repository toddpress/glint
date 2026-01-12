// ============================================================
// Glint Template Helpers (HOF-based)
// ------------------------------------------------------------
// This file bundles:
// - resolveVal() : normalize signals/computed vs raw values
// - makeTemplateHelper() : build a getter fn for templates
// - each / when / match : canonical control-flow helpers
// ============================================================

import { isSignal, isComputed } from '../core/utils.js';

// ------------------------------------------------------------
// Helper core utilities
// ------------------------------------------------------------

const resolveVal = (val) =>
  isSignal(val) || isComputed(val) ? val() : val;

const makeTemplateHelper = (source, fn) =>
  () => fn(resolveVal(source));

// ------------------------------------------------------------
// Public helpers
// ------------------------------------------------------------

export const each = (source, keyOrRender, maybeRender) => {
  // --------------------------------------------
  // Unkeyed each — structural expansion only
  if (maybeRender == null) {
    const render = keyOrRender;

    return makeTemplateHelper(source, (list) =>
      list.map(render)
    );
  }

  // --------------------------------------------
  // Keyed each — identity-aware expansion
  const keyFn = keyOrRender;
  const render = maybeRender;

  return makeTemplateHelper(source, (list) => ({
    __glintEach: true,
    keyed: true,
    items: list.map((item) => ({
      key: keyFn(item),
      tpl: render(item),
    })),
  }));
};

export const when = (cond, renderFn) =>
  makeTemplateHelper(cond, (val) => (val ? renderFn() : []));

export const match = (source, cases) =>
  makeTemplateHelper(source, (val) =>
    val in cases ? cases[val]() : cases.default?.() ?? []
  );
